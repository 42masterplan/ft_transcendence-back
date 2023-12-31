import { IsNumber, Max, Min } from 'class-validator';

export class TwoFactorAuthEmailValidateDto {
  @IsNumber()
  @Min(100000)
  @Max(999999)
  code: number;
}
