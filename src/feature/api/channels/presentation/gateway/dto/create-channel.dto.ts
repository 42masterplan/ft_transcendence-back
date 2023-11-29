import { Unique } from '@mikro-orm/core';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  @Unique()
  name: string;

  @IsString()
  password: string;

  // @IsString()
  invitedFriendIds: string[];

  @IsString()
  @IsNotEmpty()
  status: string;
}
