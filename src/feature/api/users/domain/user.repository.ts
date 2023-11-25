import { CreateUserDto } from '../presentation/dto/create-user.dto';
import { User } from './user';

export interface UserRepository {
  findOneById(id: string): Promise<User>;
  saveOne(createUserDto: CreateUserDto): Promise<User>;
  findOneByName(name: string): Promise<User>;
  isTwoFactorEnabledByIntraId(intraId: string): Promise<boolean>;
  findOneByIntraId(intraId: string): Promise<User>;
}

export const UserRepository = Symbol('UserRepository');
