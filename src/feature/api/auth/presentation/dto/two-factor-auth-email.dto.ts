import { IsEmail, MaxLength } from 'class-validator';

export class TwoFactorAuthEmailDto {
  @IsEmail()
  @MaxLength(128)
  email: string;
}
