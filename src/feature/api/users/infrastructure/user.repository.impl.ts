import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user.repository';
import { CreateUserDto } from '../presentation/dto/create-user.dto';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly em: EntityManager) {}

  async findOneById(id: string): Promise<User> {
    const user = await this.em.findOne(UserEntity, { id });
    return this.toDomain(user);
  }

  async findOneByName(name: string): Promise<User> {
    const user = await this.em.findOne(UserEntity, { name });
    return this.toDomain(user);
  }

  async findOneByIntraId(intraId: string): Promise<User> {
    const user = await this.em.findOne(UserEntity, { intraId });
    if (user)
      return this.toDomain(user);
  }

  async saveOne(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.em.create(UserEntity, createUserDto);
    await this.em.flush();
    return this.toDomain(user);
  }

  async createOne(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.em.create(UserEntity, createUserDto);
    await this.em.flush();
    return this.toDomain(user);
  }

  async isTwoFactorEnabledByIntraId(intraId: string): Promise<boolean> {
    const user = await this.findOneByIntraId(intraId);
    if (user === null) return false;
    // if (user.intraId)
  }

  private toDomain(userEntity: UserEntity): User {
    return new User({
      _id: userEntity.id,
      _intraId: userEntity.intraId,
      _name: userEntity.name,
      _is2faEnabled: userEntity.is2faEnabled,
      _email: userEntity.email,
    });
  }

  private toEntity(user: User): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = user.id;

    return userEntity;
  }
}
