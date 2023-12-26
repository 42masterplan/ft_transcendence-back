import { UserRepository } from '../../../users/domain/user.repository';
import { TwoFactorAuthType } from '../../presentation/type/two-factor-auth.type';
import { Inject, Injectable } from '@nestjs/common';
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
    return user.email;
  }

  async validate2fa(intraId: string): Promise<string> {
    const user = await this.repository.updateTwoFactorAuth(
      intraId,
      new TwoFactorAuthType({ code: null, is2faValidated: true }),
    );
    return user.email;
  }

  async updateEmailWithCode(
    intraId: string,
    email: string,
    code: number,
  ): Promise<void> {
    const saltOrRounds = 10;
    const hashedCode = await bcrypt.hash(code.toString(), saltOrRounds);
    await this.repository.updateTwoFactorAuth(
      intraId,
      new TwoFactorAuthType({
        code: hashedCode,
        isEmailValidated: false,
        email,
        is2faValidated: false,
      }),
    );
  }

  async resetEmail(intraId: string): Promise<void> {
    await this.repository.updateTwoFactorAuth(
      intraId,
      new TwoFactorAuthType({
        code: null,
        isEmailValidated: false,
        email: null,
        is2faValidated: false,
      }),
    );
  }

  async acceptEmail(intraId: string): Promise<void> {
    await this.repository.updateTwoFactorAuth(
      intraId,
      new TwoFactorAuthType({ code: null, isEmailValidated: true }),
    );
  }
}
