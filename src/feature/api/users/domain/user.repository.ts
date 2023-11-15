import { UserEntity } from '../infrastructure/user.entity';
import { CreateUserDto } from '../presentation/dto/create-user.dto';
import { User } from './user';

export interface UserRepository {
  findOne(id: string): Promise<User>;
  save(createUserDto: CreateUserDto): Promise<User>;
}

export const UserRepository = Symbol('UserRepository');
