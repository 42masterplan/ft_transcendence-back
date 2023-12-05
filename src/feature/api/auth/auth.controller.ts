import { CreateUserDto } from '../users/presentation/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Get('callback')
  async getAccessTokenFromFT(@Query('code') code: string) {
    const accessToken: string =
      await this.authService.getAccessTokenFromFT(code);
    const intraId: string = await this.authService.getUserIntraId(accessToken);
    const jwtToken: string = await this.authService.getJwtToken(intraId);
    const user = await this.usersService.findOneByIntraId(intraId);
    let isExist = true;
    let is2faEnabled = false;

    if (!user) {
      isExist = false;
      const createUserDto = new CreateUserDto(intraId);
      await this.usersService.createOne(createUserDto);
    } else {
      is2faEnabled = user.is2faEnabled;
    }

    return {
      accessToken: jwtToken,
      hasAccount: isExist,
      intraId: intraId,
      isTwoFactorEnabled: is2faEnabled,
    };
  }
}
