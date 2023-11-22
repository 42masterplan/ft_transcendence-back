import { IsBoolean, IsNumber, IsString, IsUrl } from 'class-validator';

export class MyChannelDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  userCount: number;

  @IsBoolean()
  isUnread: boolean;
}
