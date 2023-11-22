import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  password: string;

  // @IsString()
  invitedFriendIds: string[];

  @IsString()
  @IsNotEmpty()
  status: string;
}
