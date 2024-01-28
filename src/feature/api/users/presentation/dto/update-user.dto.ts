import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Matches(/^[^ {}[\]/?.,;:|)*~`!^\-_+┼<>@#$%&'"\\(=]*$/g, {
    message: 'Name should not contain special characters.',
  })
  @MaxLength(32)
  name?: string;

  @IsUrl({
    require_tld: false,
    require_protocol: true,
    require_port: true,
  })
  @Matches(new RegExp('^http://' + process.env.SERVER_DOMAIN + '/resources/'), {
    message: "Profile image url should be server's url.",
  })
  @IsOptional()
  @MaxLength(128)
  profileImage?: string;

  @IsString()
  @IsOptional()
  @MaxLength(128)
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
