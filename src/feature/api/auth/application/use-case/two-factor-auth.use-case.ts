import { UserRepository } from '../../../users/domain/user.repository';
import { TwoFactorAuthType } from '../../presentation/type/two-factor-auth.type';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TwoFactorAuthUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly repository: UserRepository,
  ) {}

  async update2faCode(intraId: string, code: number): Promise<string> {
    const saltOrRounds = 10;
    const hashedCode = await bcrypt.hash(code.toString(), saltOrRounds);
    const user = await this.repository.updateTwoFactorAuth(
      intraId,
      new TwoFactorAuthType({
        code: hashedCode,
        is2faValidated: false,
      }),
    );
    if (!user) throw new NotFoundException('There is no such user');
    return user.email;
  }

  async validate2fa(intraId: string): Promise<void> {
    const user = await this.repository.updateTwoFactorAuth(
      intraId,
      new TwoFactorAuthType({ code: null, is2faValidated: true }),
    );
    if (!user) throw new NotFoundException('Validate 2fa failed');
  }

  async updateEmailWithCode(
    intraId: string,
    email: string,
    code: number,
  ): Promise<void> {
    const saltOrRounds = 10;
    const hashedCode = await bcrypt.hash(code.toString(), saltOrRounds);
    const user = await this.repository.updateTwoFactorAuth(
      intraId,
      new TwoFactorAuthType({
        code: hashedCode,
        isEmailValidated: false,
        email,
        is2faValidated: false,
      }),
    );
    if (!user) throw new NotFoundException('Update email with code failed');
  }

  async resetEmail(intraId: string): Promise<void> {
    const user = await this.repository.updateTwoFactorAuth(
      intraId,
      new TwoFactorAuthType({
        code: null,
        isEmailValidated: false,
        email: null,
        is2faValidated: false,
      }),
    );
    if (!user) throw new NotFoundException('Reset email failed');
  }

  async acceptEmail(intraId: string): Promise<void> {
    const user = await this.repository.updateTwoFactorAuth(
      intraId,
      new TwoFactorAuthType({ code: null, isEmailValidated: true }),
    );
    if (!user) throw new NotFoundException('Accept email failed');
  }
}
