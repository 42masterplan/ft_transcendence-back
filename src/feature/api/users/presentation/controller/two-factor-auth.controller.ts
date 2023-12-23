import { TwoFactorAuthUseCase } from '../../application/use-case/two-factor-auth.use-case';
import { Controller } from '@nestjs/common';

@Controller('users/two-factor-auth')
export class TwoFactorAuthController {
  constructor(private readonly twoFactorUseCase: TwoFactorAuthUseCase) {}
}
