import { CreateUserDto } from '../presentation/dto/create-user.dto';
import { UpdateUserDto } from '../presentation/dto/update-user.dto';
import { User } from './user';

export interface UserRepository {
  findOneById(id: string): Promise<User>;
  findOneByName(name: string): Promise<User>;
  findOneByIntraId(intraId: string): Promise<User>;
  updateOne(intraId: string, updateUserDto: UpdateUserDto): Promise<User>;
  createOne(createUserDto: CreateUserDto): Promise<User>;
}

export const UserRepository = Symbol('UserRepository');
