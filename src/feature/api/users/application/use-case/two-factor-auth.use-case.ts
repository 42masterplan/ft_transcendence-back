import { UserRepository } from '../../domain/user.repository';
import { TwoFactorAuthType } from '../../presentation/type/two-factor-auth.type';
import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TwoFactorAuthUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly repository: UserRepository,
  ) {}

  async updateOneWithEmail(
    intraId: string,
    email: string,
    code: number,
  ): Promise<void> {
    const saltOrRounds = 10;
    const hashedCode = await bcrypt.hash(code.toString(), saltOrRounds);
    await this.repository.updateTwoFactor(
      intraId,
      new TwoFactorAuthType({
        code: hashedCode,
        isEmailValidated: false,
        email,
      }),
    );
  }

  async reset(intraId: string): Promise<void> {
    await this.repository.updateTwoFactor(
      intraId,
      new TwoFactorAuthType({
        code: null,
        isEmailValidated: false,
        email: null,
      }),
    );
  }

  async accept(intraId: string): Promise<void> {
    await this.repository.updateTwoFactor(
      intraId,
      new TwoFactorAuthType({ code: null, isEmailValidated: true }),
    );
  }
}
