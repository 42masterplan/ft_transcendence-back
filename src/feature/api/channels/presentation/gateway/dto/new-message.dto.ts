import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class NewMessageDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  userCount: number;

  @IsBoolean()
  isUnread: boolean;
}
