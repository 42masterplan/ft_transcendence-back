import { MailService } from '../../../mail/mail.service';
import { UsersService } from '../../../users/users.service';
import { TwoFactorAuthUseCase } from '../../application/use-case/two-factor-auth.use-case';
import { TwoFactorAuthEmailValidateDto } from '../dto/two-factor-auth-email-validate.dto';
import { TwoFactorAuthEmailDto } from '../dto/two-factor-auth-email.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';

@Controller('users/two-factor-auth')
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthUseCase: TwoFactorAuthUseCase,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @UseGuards(AuthGuard('register'))
  @Put('email')
  async updateEmail(
    @Request() req,
    @Body() twoFactorAuthEmail: TwoFactorAuthEmailDto,
  ): Promise<boolean> {
    const intraId = req.user.sub;
    const code = Math.floor(Math.random() * 899999) + 100000;
    await this.twoFactorAuthUseCase.updateEmailWithCode(
      intraId,
      twoFactorAuthEmail.email,
      code,
    );
    await this.mailService.sendMail(twoFactorAuthEmail.email, code);
    return true;
  }

  @UseGuards(AuthGuard('register'))
  @Post('email/validate')
  async validateEmail(
    @Request() req,
    @Body() twoFactorAuthEmailValidate: TwoFactorAuthEmailValidateDto,
  ): Promise<boolean> {
    const intraId = req.user.sub;
    const user = await this.usersService.findOneByIntraId(intraId);
    const expiredDate = new Date();
    expiredDate.setMinutes(expiredDate.getMinutes() - 5);

    if (user.isEmailValidated === true) return true;
    if (user.verificationCode === null || user.updatedAt <= expiredDate) {
      await this.twoFactorAuthUseCase.resetEmail(intraId);
      throw new BadRequestException();
    }
    const isMatch = await bcrypt.compare(
      twoFactorAuthEmailValidate.code.toString(),
      user.verificationCode,
    );
    if (isMatch) await this.twoFactorAuthUseCase.acceptEmail(intraId);

    return isMatch;
  }

  @UseGuards(AuthGuard('email'))
  @Post('')
  async request2fa(@Request() req) {
    const intraId = req.user.sub;
    const code = Math.floor(Math.random() * 899999) + 100000;
    const email = await this.twoFactorAuthUseCase.update2faCode(intraId, code);
    await this.mailService.sendMail(email, code);
    return email;
  }

  @UseGuards(AuthGuard('email'))
  @Post('validate')
  async validate2fa(
    @Request() req,
    @Body() twoFactorAuthEmailValidate: TwoFactorAuthEmailValidateDto,
  ) {
    const intraId = req.user.sub;
    const user = await this.usersService.findOneByIntraId(intraId);
    const expiredDate = new Date();
    expiredDate.setMinutes(expiredDate.getMinutes() - 5);

    // TODO: 2FA enabled가 false라면?
    if (user.is2faValidated === true) return true;
    if (user.verificationCode === null || user.updatedAt <= expiredDate)
      throw new BadRequestException();

    const isMatch = await bcrypt.compare(
      twoFactorAuthEmailValidate.code.toString(),
      user.verificationCode,
    );
    if (isMatch) await this.twoFactorAuthUseCase.validate2fa(intraId);

    return isMatch;
  }
}
