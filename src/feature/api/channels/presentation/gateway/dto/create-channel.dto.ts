import { IsIn, IsNotEmpty, IsString } from 'class-validator';

const status = ['Public', 'Private'];

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
  @IsIn(status)
  status: string;
}
