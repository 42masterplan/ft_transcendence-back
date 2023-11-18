import { IsBoolean, IsString, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsUrl()
  profileImage: string;

  @IsString()
  introduction: string;

  @IsString()
  intraId: string;

  @IsBoolean()
  is2faEnabled: boolean;
}
