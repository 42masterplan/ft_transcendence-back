import { IsBoolean, IsNumber, IsString, MaxLength } from 'class-validator';

export class PublicChannelDto {
  @IsString()
  @MaxLength(64)
  name: string;

  @IsNumber()
  userCount: number;

  @IsBoolean()
  isPassword: boolean;

  @IsString()
  id: string;
}
