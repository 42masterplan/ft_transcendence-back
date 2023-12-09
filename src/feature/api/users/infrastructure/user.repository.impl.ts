import { User } from '../domain/user';
import { UserRepository } from '../domain/user.repository';
import { CreateUserDto } from '../presentation/dto/create-user.dto';
import { UpdateUserDto } from '../presentation/dto/update-user.dto';
import { UserEntity } from './user.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly em: EntityManager) {}

  async findOneById(id: string): Promise<User | null> {
    const user = await this.em.findOne(UserEntity, { id });
    if (!user) return null;

    return this.toDomain(user);
  }

  async findOneByName(name: string): Promise<User | null> {
    const user = await this.em.findOne(UserEntity, { name });
    if (!user) return null;

    return this.toDomain(user);
  }

  async findOneByIntraId(intraId: string): Promise<User> {
    const user = await this.em.findOne(UserEntity, { intraId });
    if (user) return this.toDomain(user);
  }

  async updateOne(
    intraId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.em.findOne(UserEntity, { intraId });
    if (updateUserDto.name !== null && updateUserDto.name !== undefined)
      user.name = updateUserDto.name;
    if (
      updateUserDto.profileImage !== null &&
      updateUserDto.profileImage !== undefined
    )
      user.profileImage = updateUserDto.profileImage;
    if (
      updateUserDto.is2faEnabled !== null &&
      updateUserDto.is2faEnabled !== undefined
    )
      user.is2faEnabled = updateUserDto.is2faEnabled;
    if (
      updateUserDto.introduction !== null &&
      updateUserDto.introduction !== undefined
    )
      user.introduction = updateUserDto.introduction;
    await this.em.flush();
    return this.toDomain(user);
  }

  async createOne(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.em.create(UserEntity, createUserDto);
    await this.em.flush();
    return this.toDomain(user);
  }

  private toDomain(userEntity: UserEntity): User {
    return new User({
      id: userEntity.id,
      intraId: userEntity.intraId,
      name: userEntity.name,
      profileImage: userEntity.profileImage,
      is2faEnabled: userEntity.is2faEnabled,
      email: userEntity.email,
      currentStatus: userEntity.currentStatus,
      introduction: userEntity.introduction,
      isValidateEmail: userEntity.isValidateEmail,
      verificationCode: userEntity.verificationCode,
      isDeleted: userEntity.isDeleted,
    });
  }

  private toEntity(user: User): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = user.id;
    userEntity.intraId = user.intraId;
    userEntity.name = user.name;
    userEntity.profileImage = user.profileImage;
    userEntity.is2faEnabled = user.is2faEnabled;
    userEntity.email = user.email;
    userEntity.currentStatus = user.currentStatus;
    userEntity.introduction = user.introduction;
    userEntity.verificationCode = user.verificationCode;
    userEntity.isValidateEmail = user.isValidateEmail;
    userEntity.isDeleted = user.isDeleted;

    return userEntity;
  }
}
