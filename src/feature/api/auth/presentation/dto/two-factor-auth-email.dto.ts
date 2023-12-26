import { IsEmail } from 'class-validator';

export class TwoFactorAuthEmailDto {
  @IsEmail()
  email: string;
}
