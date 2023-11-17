import { IsBoolean, IsString, IsUrl } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  channelName: string;

  @IsString()
  password: string;

  @IsString()
  invitedFriendIds: string[];

  @IsString()
  status: string;
}
