import { MikroORM } from '@mikro-orm/core';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user.repository';
import { UserEntity } from './user.entity';

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly orm: MikroORM) {}

  async findOne(id: number): Promise<User> {
    const user = await this.orm.em.findOne(UserEntity, { id });

    return this.toDomain(user);
  }

  private toDomain(userEntity: UserEntity): User {
    return new User({
      _id: userEntity.id,
    });
  }

  private toEntity(user: User): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = user.id;

    return userEntity;
  }
}
