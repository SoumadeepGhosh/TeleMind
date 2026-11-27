import { ConflictException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { TelegramService } from '../telegram/telegram.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { encryptCredential } from './credential-vault';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegram: TelegramService,
    private readonly whatsapp: WhatsappService,
  ) {}

  private assertAdmin(user: AuthenticatedUser): void {
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only workspace owners and admins can manage integrations.');
    }
  }

  async status(user: AuthenticatedUser) {
    const [telegram, whatsapp] = await Promise.all([
      this.prisma.integration.findUnique({
        where: { organizationId_provider: { organizationId: user.organizationId, provider: 'TELEGRAM' } },
        select: { status: true, externalName: true, lastError: true, connectedAt: true },
      }),
      this.prisma.integration.findFirst({
        where: { provider: 'WHATSAPP_DEMO' },
        select: { organizationId: true },
      }),
    ]);

    const ownsWhatsappDemo = whatsapp?.organizationId === user.organizationId;
    return {
      telegram: {
        connected: this.telegram.isConnected(user.organizationId),
        botUsername: telegram?.externalName || null,
        status: telegram?.status || 'DISCONNECTED',
        lastError: telegram?.lastError || null,
        connectedAt: telegram?.connectedAt || null,
      },
      whatsappDemo: {
        claimedByWorkspace: ownsWhatsappDemo,
        available: !whatsapp || ownsWhatsappDemo,
        status: ownsWhatsappDemo
          ? this.whatsapp.isConnected
            ? 'CONNECTED'
            : this.whatsapp.initError
              ? 'ERROR'
              : 'WAITING_FOR_QR'
          : 'UNAVAILABLE',
        lastError: ownsWhatsappDemo ? this.whatsapp.initError : null,
        qrAvailable: ownsWhatsappDemo && Boolean(this.whatsapp.latestQr),
        phoneNumber: ownsWhatsappDemo ? this.whatsapp.connectedNumber : null,
      },
    };
  }

  async connectTelegram(user: AuthenticatedUser, token: string) {
    this.assertAdmin(user);
    const cleanToken = token.trim();
    let botUsername: string;
    try {
      botUsername = await this.telegram.validateToken(cleanToken);
    } catch {
      throw new ConflictException('Telegram rejected this bot token. Check the token from @BotFather and try again.');
    }

    const owner = await this.prisma.integration.findFirst({
      where: { provider: 'TELEGRAM', externalName: botUsername, organizationId: { not: user.organizationId } },
    });
    if (owner) throw new ConflictException('This Telegram bot is already connected to another workspace.');

    const connection = await this.prisma.integration.upsert({
      where: { organizationId_provider: { organizationId: user.organizationId, provider: 'TELEGRAM' } },
      create: {
        organizationId: user.organizationId,
        provider: 'TELEGRAM',
        status: 'PENDING',
        externalName: botUsername,
        credentialsEncrypted: encryptCredential(cleanToken),
      },
      update: {
        status: 'PENDING',
        externalName: botUsername,
        credentialsEncrypted: encryptCredential(cleanToken),
        lastError: null,
      },
    });
    try {
      await this.telegram.connectWorkspace(user.organizationId, cleanToken);
      await this.prisma.integration.update({ where: { id: connection.id }, data: { status: 'CONNECTED', connectedAt: new Date() } });
    } catch {
      await this.prisma.integration.update({
        where: { id: connection.id },
        data: { status: 'ERROR', lastError: 'The bot could not start polling. Check that it is not running elsewhere.' },
      });
      throw new ServiceUnavailableException('Telegram token was accepted, but the bot could not start. Check whether another service is polling this bot.');
    }
    return { connected: true, botUsername };
  }

  async disconnectTelegram(user: AuthenticatedUser) {
    this.assertAdmin(user);
    await this.telegram.disconnectWorkspace(user.organizationId);
    await this.prisma.integration.deleteMany({ where: { organizationId: user.organizationId, provider: 'TELEGRAM' } });
    return { disconnected: true };
  }

  async claimWhatsappDemo(user: AuthenticatedUser) {
    this.assertAdmin(user);
    const current = await this.prisma.integration.findFirst({ where: { provider: 'WHATSAPP_DEMO' } });
    if (current && current.organizationId !== user.organizationId) {
      throw new ConflictException('The shared WhatsApp demo is claimed by another workspace. Ask its owner to disconnect it first.');
    }
    if (!current) {
      await this.prisma.integration.create({
        data: { organizationId: user.organizationId, provider: 'WHATSAPP_DEMO', demoSlot: 1, status: 'PENDING' },
      });
    }
    this.whatsapp.setWorkspace(user.organizationId);
    return { claimed: true, connected: this.whatsapp.isConnected, qrAvailable: Boolean(this.whatsapp.latestQr) };
  }

  async whatsappQr(user: AuthenticatedUser) {
    const claim = await this.prisma.integration.findFirst({ where: { provider: 'WHATSAPP_DEMO' } });
    if (!claim || claim.organizationId !== user.organizationId) {
      throw new NotFoundException('This workspace has not claimed the shared WhatsApp demo.');
    }
    if (this.whatsapp.isConnected) return { connected: true, qrDataUrl: null };
    if (!this.whatsapp.latestQr) return { connected: false, qrDataUrl: null, waiting: true };
    const QRCode = require('qrcode');
    const qrDataUrl = await QRCode.toDataURL(this.whatsapp.latestQr, { width: 320, margin: 2, errorCorrectionLevel: 'M' });
    return { connected: false, qrDataUrl, waiting: false };
  }

  async releaseWhatsappDemo(user: AuthenticatedUser) {
    this.assertAdmin(user);
    const result = await this.prisma.integration.deleteMany({
      where: { organizationId: user.organizationId, provider: 'WHATSAPP_DEMO' },
    });
    if (!result.count) throw new NotFoundException('This workspace does not own the WhatsApp demo connection.');
    this.whatsapp.setWorkspace(null);
    return { disconnected: true };
  }
}
