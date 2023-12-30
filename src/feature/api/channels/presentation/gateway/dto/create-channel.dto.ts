import { IsNotEmpty, IsString, NotContains } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  @NotContains(' ')
  name: string;

  @IsString()
  @NotContains(' ')
  password: string;

  // @IsString()
  invitedFriendIds: string[];

  @IsString()
  @IsNotEmpty()
  status: string;
}
