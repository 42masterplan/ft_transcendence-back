import { IsBoolean, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(32)
  intraId: string;

  @IsUrl()
  @MaxLength(128)
  profileImage: string = process.env.SERVER_URL + '/resources/panda_health.svg';

  @IsString()
  @MaxLength(128)
  introduction: string = '';

  @IsBoolean()
  is2faEnabled: boolean = false;

  constructor(intraId: string) {
    this.intraId = intraId;
  }
}
