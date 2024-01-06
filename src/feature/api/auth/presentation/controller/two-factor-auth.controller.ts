import { MailService } from '../../../mail/mail.service';
import { UsersUseCase } from '../../../users/application/use-case/users.use-case';
import { TwoFactorAuthUseCase } from '../../application/use-case/two-factor-auth.use-case';
import { JwtEmailGuard } from '../../jwt/jwt-email.guard';
import { JwtRegisterGuard } from '../../jwt/jwt-register.guard';
import { TwoFactorAuthEmailValidateDto } from '../dto/two-factor-auth-email-validate.dto';
import { TwoFactorAuthEmailDto } from '../dto/two-factor-auth-email.dto';
import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Controller('users/two-factor-auth')
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthUseCase: TwoFactorAuthUseCase,
    private readonly usersUseCase: UsersUseCase,
    private readonly mailService: MailService,
  ) {}

  @UseGuards(JwtRegisterGuard)
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

  @UseGuards(JwtRegisterGuard)
  @Post('email/validate')
  async validateEmail(
    @Request() req,
    @Body() twoFactorAuthEmailValidate: TwoFactorAuthEmailValidateDto,
  ): Promise<boolean> {
    const intraId = req.user.sub;
    const user = await this.usersUseCase.findOneByIntraId(intraId);
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

  @UseGuards(JwtEmailGuard)
  @Post('')
  async request2fa(@Request() req) {
    const intraId = req.user.sub;
    const code = Math.floor(Math.random() * 899999) + 100000;
    const email = await this.twoFactorAuthUseCase.update2faCode(intraId, code);
    if (!email) throw new NotFoundException('There is no email');
    await this.mailService.sendMail(email, code);
    return { email: email };
  }

  @UseGuards(JwtEmailGuard)
  @Post('validate')
  async validate2fa(
    @Request() req,
    @Body() twoFactorAuthEmailValidate: TwoFactorAuthEmailValidateDto,
  ) {
    const intraId = req.user.sub;
    const user = await this.usersUseCase.findOneByIntraId(intraId);
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
