import { TwoFactorAuthType } from '../../auth/presentation/type/two-factor-auth.type';
import { TIER } from '../../game/presentation/type/tier.enum';
import { CreateUserDto } from '../presentation/dto/create-user.dto';
import { UpdateUserDto } from '../presentation/dto/update-user.dto';
import { User } from './user';

export interface UserRepository {
  findAll(): Promise<User[]>;
  findOneById(id: string): Promise<User>;
  findOneByName(name: string): Promise<User>;
  findOneByIntraId(intraId: string): Promise<User>;
  updateOne(intraId: string, updateUserDto: UpdateUserDto): Promise<User>;
  updateStatusByIntraId(intraId: string, status: string): Promise<User>;
  updateStatusById(id: string, status: string): Promise<User>;
  updateTierAndExp(id: string, tier: TIER, exp: number): Promise<User>;
  createOne(createUserDto: CreateUserDto): Promise<User>;
  updateTwoFactorAuth(
    intraId: string,
    twoFactorAuth: TwoFactorAuthType,
  ): Promise<User>;
  resetTwoFactorAuthValidation(intraId: string): Promise<void>;
}

export const UserRepository = Symbol('UserRepository');
