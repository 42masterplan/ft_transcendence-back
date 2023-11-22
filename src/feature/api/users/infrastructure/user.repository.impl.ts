import { EntityAssigner, MikroORM } from '@mikro-orm/core';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user.repository';
import { UserEntity } from './user.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { DmEntity } from './dm.entity';
import { CreateUserDto } from '../presentation/dto/create-user.dto';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly em: EntityManager) {}

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.em.findOne(UserEntity, { id });
    return user;
  }

  async save(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.em.create(UserEntity, createUserDto);
    await this.em.flush();
    return this.toDomain(user);
  }

  private toDomain(userEntity: UserEntity): User {
    return new User({
      _id: userEntity.id,
      _name: userEntity.name,
      _email: userEntity.email,
    });
  }

  private toEntity(user: User): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = user.id;

    return userEntity;
  }
}
