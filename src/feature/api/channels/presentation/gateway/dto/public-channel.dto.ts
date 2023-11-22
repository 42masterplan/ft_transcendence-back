import { IsBoolean, IsNumber, IsString, IsUrl } from 'class-validator';

export class PublicChannelDto {
  @IsString()
  name: string;

  @IsNumber()
  userCount: number;

  @IsBoolean()
  isPassword: boolean;

  @IsString()
  id: string;
}
