import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

const status = ['Public', 'Private'];

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @IsString()
  @MaxLength(128)
  password: string;

  // @IsString()
  invitedFriendIds: string[];

  @IsString()
  @IsNotEmpty()
  @IsIn(status)
  status: string;
}
