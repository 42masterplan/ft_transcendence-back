import {
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class RankDto {
  @IsPositive()
  win: number;

  @IsPositive()
  lose: number;

  @IsString()
  tier: string;
}

export class ChallengeDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progressRate: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  achieveRatio: number;

  @IsUrl()
  icon: string;
}

export class UserInfoDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsUrl()
  profileImage: string;

  @IsString()
  currentStatus: string;

  @IsString()
  introduction: string;

  rank: RankDto;

  challenges: Array<ChallengeDto>;
}
