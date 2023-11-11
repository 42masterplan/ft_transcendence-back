import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('callback')
  async getAccessTokenFromFT(@Query('code') code: string) {
    const accessToken = await this.authService.getAccessTokenFromFT(code);
    const intraId = await this.authService.getUserIntraId(accessToken);
    const jwtToken = await this.authService.getJwtToken(intraId);

    return {
      accessToken: jwtToken,
      hasAccount: true,
      isTwoFactorEnabled: true,
    };
  }
}
