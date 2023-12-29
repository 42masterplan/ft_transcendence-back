import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  NotContains,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @NotContains(' ')
  @IsOptional()
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
}
