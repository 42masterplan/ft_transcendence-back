import { IsBoolean, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  channelName: string;

  @IsString()
  password: string;

  @IsString()
  invitedFriendIds: string[];

  @IsString()
  @IsNotEmpty()
  status: string;
}
