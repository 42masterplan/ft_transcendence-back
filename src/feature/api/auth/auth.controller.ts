import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('callback')
  async getAccessToken(@Query('code') code: string) {
    const accessToken = await this.authService.getAccessToken(code);
    const intraId = await this.authService.getUserIntraId(accessToken);
    const jwtToken = await this.authService.getJwtToken(intraId);
    return {
      accessToken: jwtToken,
      hasAccount: true,
      isTwoFactorEnabled: true,
    };
  }
}
