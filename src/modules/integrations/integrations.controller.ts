import { Body, Controller, Delete, Get, Header, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedUser } from '../auth/auth.types';
import { ConnectTelegramDto } from './integrations.dto';
import { IntegrationsService } from './integrations.service';

@UseGuards(AuthGuard('jwt'))
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrations: IntegrationsService) {}

  @Get('status')
  status(@Req() req: { user: AuthenticatedUser }) {
    return this.integrations.status(req.user);
  }

  @Put('telegram')
  connectTelegram(@Body() body: ConnectTelegramDto, @Req() req: { user: AuthenticatedUser }) {
    return this.integrations.connectTelegram(req.user, body.token);
  }

  @Delete('telegram')
  disconnectTelegram(@Req() req: { user: AuthenticatedUser }) {
    return this.integrations.disconnectTelegram(req.user);
  }

  @Post('whatsapp-demo')
  claimWhatsappDemo(@Req() req: { user: AuthenticatedUser }) {
    return this.integrations.claimWhatsappDemo(req.user);
  }

  @Get('whatsapp-demo/qr')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  whatsappQr(@Req() req: { user: AuthenticatedUser }) {
    return this.integrations.whatsappQr(req.user);
  }

  @Delete('whatsapp-demo')
  releaseWhatsappDemo(@Req() req: { user: AuthenticatedUser }) {
    return this.integrations.releaseWhatsappDemo(req.user);
  }
}
