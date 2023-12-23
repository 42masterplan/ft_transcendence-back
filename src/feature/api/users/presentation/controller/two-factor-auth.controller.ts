import { MailService } from '../../../mail/mail.service';
import { TwoFactorAuthUseCase } from '../../application/use-case/two-factor-auth.use-case';
import { UsersService } from '../../users.service';
import { TwoFactorEmailValidateDto } from '../dto/two-factor-email-validate.dto';
import { TwoFactorEmailDto } from '../dto/two-factor-email.dto';
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
    private readonly twoFactorUseCase: TwoFactorAuthUseCase,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @UseGuards(AuthGuard('register'))
  @Put('email')
  async updateEmail(
    @Request() req,
    @Body() twoFactorEmail: TwoFactorEmailDto,
  ): Promise<boolean> {
    const intraId = req.user.sub;
    const code = Math.floor(Math.random() * 899999) + 100000;
    await this.twoFactorUseCase.updateEmailWithCode(
      intraId,
      twoFactorEmail.email,
      code,
    );
    await this.mailService.sendMail(twoFactorEmail.email, code);
    return true;
  }

  @UseGuards(AuthGuard('register'))
  @Post('email/validate')
  async validateEmail(
    @Request() req,
    @Body() twoFactorEmailValidate: TwoFactorEmailValidateDto,
  ): Promise<boolean> {
    const intraId = req.user.sub;
    const user = await this.usersService.findOneByIntraId(intraId);
    const expiredDate = new Date();
    expiredDate.setMinutes(expiredDate.getMinutes() - 5);

    if (user.isEmailValidated === true) return true;
    if (user.verificationCode === null || user.updatedAt <= expiredDate) {
      await this.twoFactorUseCase.resetEmail(intraId);
      throw new BadRequestException();
    }
    const isMatch = await bcrypt.compare(
      twoFactorEmailValidate.code.toString(),
      user.verificationCode,
    );
    if (isMatch) await this.twoFactorUseCase.acceptEmail(intraId);

    return isMatch;
  }

  @UseGuards(AuthGuard('email'))
  @Post('')
  async request2fa(@Request() req) {
    const intraId = req.user.sub;
    const code = Math.floor(Math.random() * 899999) + 100000;
    const email = await this.twoFactorUseCase.update2faCode(intraId, code);
    await this.mailService.sendMail(email, code);
    return true;
  }

  @UseGuards(AuthGuard('email'))
  @Post('validate')
  async validate2fa(
    @Request() req,
    @Body() twoFactorEmailValidate: TwoFactorEmailValidateDto,
  ) {
    const intraId = req.user.sub;
    const user = await this.usersService.findOneByIntraId(intraId);
    const expiredDate = new Date();
    expiredDate.setMinutes(expiredDate.getMinutes() - 5);

    if (user.is2faValidated === true) return true;
    if (user.verificationCode === null || user.updatedAt <= expiredDate)
      throw new BadRequestException();

    const isMatch = await bcrypt.compare(
      twoFactorEmailValidate.code.toString(),
      user.verificationCode,
    );
    if (isMatch) await this.twoFactorUseCase.validate2fa(intraId);

    return isMatch;
  }
}
