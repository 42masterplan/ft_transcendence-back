import { UsersUseCase } from '../../../users/application/use-case/users.use-case';
import { CreateUserDto } from '../../../users/presentation/dto/create-user.dto';
import { UsersService } from '../../../users/users.service';
import { AuthService } from '../../auth.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly usersUseCase: UsersUseCase,
  ) {}

  @Get('callback')
  async getAccessTokenFromFT(@Query('code') code: string) {
    const accessToken: string =
      await this.authService.getAccessTokenFromFT(code);
    const intraId: string = await this.authService.getUserIntraId(accessToken);
    const jwtToken: string = await this.authService.getJwtToken(intraId);
    const user = await this.usersService.findOneByIntraId(intraId);
    let isExist = false;
    let is2faEnabled = false;
    let isSignInFinish = false;

    if (!user) {
      const createUserDto = new CreateUserDto(intraId);
      await this.usersService.createOne(createUserDto);
    } else if (user.name !== null) {
      isSignInFinish = true;
      if (user.email !== null && user.isEmailValidated) {
        isExist = true;
        if (user.is2faEnabled) is2faEnabled = true;
      }
    }
    await this.usersUseCase.resetTwoFactorAuthValidation(intraId);

    return {
      accessToken: jwtToken,
      hasAccount: isExist,
      hasProfile: isSignInFinish,
      intraId: intraId,
      isTwoFactorEnabled: is2faEnabled,
    };
  }
}
