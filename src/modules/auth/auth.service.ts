import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser, JwtPayload } from './auth.types';

const scrypt = promisify(scryptCallback);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: {
    email: string;
    password: string;
    fullName: string;
    organizationName: string;
  }): Promise<{ accessToken: string; user: AuthenticatedUser }> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('An account with this email already exists.');

    const passwordHash = await this.hashPassword(input.password);
    const slug = await this.uniqueSlug(input.organizationName);
    const created = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, fullName: input.fullName.trim(), passwordHash },
      });
      const organization = await tx.organization.create({
        data: { name: input.organizationName.trim(), slug },
      });
      await tx.membership.create({
        data: { userId: user.id, organizationId: organization.id, role: 'OWNER' },
      });
      return { user, organization };
    });

    const user: AuthenticatedUser = {
      id: created.user.id,
      email: created.user.email,
      fullName: created.user.fullName,
      organizationId: created.organization.id,
      organizationName: created.organization.name,
      role: 'OWNER',
    };
    return { accessToken: await this.issueToken(user), user };
  }

  async login(emailInput: string, password: string): Promise<{ accessToken: string; user: AuthenticatedUser }> {
    const userRecord = await this.prisma.user.findUnique({
      where: { email: emailInput.trim().toLowerCase() },
      include: {
        memberships: {
          include: { organization: true },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });
    if (!userRecord || !userRecord.isActive || !(await this.verifyPassword(password, userRecord.passwordHash))) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    const membership = userRecord.memberships[0];
    if (!membership) throw new UnauthorizedException('This account is not assigned to a workspace.');
    const user: AuthenticatedUser = {
      id: userRecord.id,
      email: userRecord.email,
      fullName: userRecord.fullName,
      organizationId: membership.organizationId,
      organizationName: membership.organization.name,
      role: membership.role,
    };
    return { accessToken: await this.issueToken(user), user };
  }

  async getProfile(userId: string, organizationId: string): Promise<AuthenticatedUser> {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      include: { user: true, organization: true },
    });
    if (!membership || !membership.user.isActive) {
      throw new UnauthorizedException('Workspace membership is no longer active.');
    }
    return {
      id: membership.user.id,
      email: membership.user.email,
      fullName: membership.user.fullName,
      organizationId,
      organizationName: membership.organization.name,
      role: membership.role,
    };
  }

  async listOrganizations(userId: string): Promise<Array<{ id: string; name: string; slug: string; role: string }>> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: { organization: true },
      orderBy: { createdAt: 'asc' },
    });
    return memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      role: m.role,
    }));
  }

  async createOrganization(userId: string, name: string): Promise<{ accessToken: string; user: AuthenticatedUser }> {
    const trimmedName = name.trim();
    if (!trimmedName) throw new ConflictException('Organization name cannot be empty.');
    const userRecord = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userRecord) throw new UnauthorizedException('User not found.');

    const slug = await this.uniqueSlug(trimmedName);
    const created = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: trimmedName, slug },
      });
      const membership = await tx.membership.create({
        data: { userId, organizationId: org.id, role: 'OWNER' },
      });
      return { org, membership };
    });

    const user: AuthenticatedUser = {
      id: userRecord.id,
      email: userRecord.email,
      fullName: userRecord.fullName,
      organizationId: created.org.id,
      organizationName: created.org.name,
      role: 'OWNER',
    };
    return { accessToken: await this.issueToken(user), user };
  }

  async switchOrganization(userId: string, organizationId: string): Promise<{ accessToken: string; user: AuthenticatedUser }> {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      include: { user: true, organization: true },
    });
    if (!membership || !membership.user.isActive) {
      throw new UnauthorizedException('You do not have access to this workspace.');
    }
    const user: AuthenticatedUser = {
      id: membership.user.id,
      email: membership.user.email,
      fullName: membership.user.fullName,
      organizationId: membership.organization.id,
      organizationName: membership.organization.name,
      role: membership.role,
    };
    return { accessToken: await this.issueToken(user), user };
  }

  async updateOrganizationName(
    userId: string,
    organizationId: string,
    newName: string,
  ): Promise<{ id: string; name: string }> {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });
    if (!membership) throw new UnauthorizedException('Membership not found.');
    if (membership.role === 'AGENT') {
      throw new UnauthorizedException('Only workspace Owners and Admins can rename the organization.');
    }

    const trimmed = newName.trim();
    if (!trimmed) throw new ConflictException('Name cannot be empty.');

    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data: { name: trimmed },
    });
    return { id: updated.id, name: updated.name };
  }

  private async issueToken(user: AuthenticatedUser): Promise<string> {
    return this.jwt.signAsync({ sub: user.id, organizationId: user.organizationId } satisfies JwtPayload);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hash = (await scrypt(password, salt, 64)) as Buffer;
    return `scrypt$${salt}$${hash.toString('hex')}`;
  }

  private async verifyPassword(password: string, stored: string): Promise<boolean> {
    const [scheme, salt, expectedHex] = stored.split('$');
    if (scheme !== 'scrypt' || !salt || !expectedHex) return false;
    const expected = Buffer.from(expectedHex, 'hex');
    const actual = (await scrypt(password, salt, expected.length)) as Buffer;
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'workspace';
    let candidate = base;
    while (await this.prisma.organization.findUnique({ where: { slug: candidate } })) {
      candidate = `${base}-${randomBytes(3).toString('hex')}`;
    }
    return candidate;
  }
}
