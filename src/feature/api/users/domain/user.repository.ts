import { User } from './user';

export interface UserRepository {
  findOne(id: number): Promise<User>;
}

export const UserRepository = Symbol('UserRepository');
