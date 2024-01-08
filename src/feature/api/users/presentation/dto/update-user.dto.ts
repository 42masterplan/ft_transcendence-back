import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Matches(/[^가-힣a-zA-Z0-9]/g)
  name?: string;

  @IsUrl({
    require_tld: false,
    require_protocol: true,
    require_port: true,
  })
  @IsOptional()
  profileImage?: string;

  @IsString()
  @IsOptional()
  introduction?: string;

  @IsBoolean()
  @IsOptional()
  is2faEnabled?: boolean;

  constructor(props: {
    name?: string;
    profileImage?: string;
    introduction?: string;
    is2faEnabled?: boolean;
  }) {
    this.name = props?.name;
    this.profileImage = props?.profileImage;
    this.introduction = props?.introduction;
    this.is2faEnabled = props?.is2faEnabled;
  }
}
