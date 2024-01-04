import { IsBoolean, IsString, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsString()
  intraId: string;

  @IsUrl()
  profileImage: string = process.env.SERVER_URL + '/resources/panda_health.svg';

  @IsString()
  introduction: string = '';

  @IsBoolean()
  is2faEnabled: boolean = false;

  constructor(intraId: string) {
    this.intraId = intraId;
  }
}
