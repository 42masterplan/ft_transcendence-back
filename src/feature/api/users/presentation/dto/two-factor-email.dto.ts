import { IsEmail } from 'class-validator';

export class TwoFactorEmailDto {
  @IsEmail()
  email: string;
}
