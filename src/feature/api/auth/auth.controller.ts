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
    // const isExist = await this.usersService.isExist({ name: intraId });
    const isExist = true;
    const is2faEnabled = false;
    if (isExist) {
      // is2faEnabled = await this.usersService.isTwoFactorEnabled({
      //   name: intraId,
      // });
    }

    return {
      accessToken: jwtToken,
      hasAccount: isExist,
      intraId: intraId,
      isTwoFactorEnabled: is2faEnabled,
    };
  }
}
