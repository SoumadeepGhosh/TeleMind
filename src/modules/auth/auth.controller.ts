import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  CreateOrganizationDto,
  LoginDto,
  RegisterDto,
  SwitchOrganizationDto,
  UpdateOrganizationDto,
} from './auth.dto';
import { AuthenticatedUser } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() request: { user: AuthenticatedUser }): AuthenticatedUser {
    return request.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('organizations')
  listOrganizations(@Req() request: { user: AuthenticatedUser }) {
    return this.auth.listOrganizations(request.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('organizations')
  createOrganization(
    @Body() body: CreateOrganizationDto,
    @Req() request: { user: AuthenticatedUser },
  ) {
    return this.auth.createOrganization(request.user.id, body.name);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('switch-org')
  switchOrganization(
    @Body() body: SwitchOrganizationDto,
    @Req() request: { user: AuthenticatedUser },
  ) {
    return this.auth.switchOrganization(request.user.id, body.organizationId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('organization')
  updateOrganization(
    @Body() body: UpdateOrganizationDto,
    @Req() request: { user: AuthenticatedUser },
  ) {
    return this.auth.updateOrganizationName(
      request.user.id,
      request.user.organizationId,
      body.name,
    );
  }
}
