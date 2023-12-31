import { TwoFactorAuthType } from '../../auth/presentation/type/two-factor-auth.type';
import { TIER } from '../../game/presentation/type/tier.enum';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user.repository';
import { CreateUserDto } from '../presentation/dto/create-user.dto';
import { UpdateUserDto } from '../presentation/dto/update-user.dto';
import { UserEntity } from './user.entity';
import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: EntityRepository<UserEntity>,
  ) {}

  async findAll(): Promise<User[]> {
    const notNullUsers = await this.repository.find(
      { isDeleted: false, name: { $ne: null } },
      { orderBy: { name: QueryOrder.ASC } },
    );
    return notNullUsers.map((user) => this.toDomain(user));
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.repository.findOne({ id, isDeleted: false });
    if (!user) return;

    return this.toDomain(user);
  }

  async findOneByName(name: string): Promise<User> {
    const user = await this.repository.findOne({ name, isDeleted: false });
    if (!user) return;

    return this.toDomain(user);
  }

  async findOneByIntraId(intraId: string): Promise<User> {
    const user = await this.repository.findOne({
      intraId,
      isDeleted: false,
    });
    if (!user) return;

    return this.toDomain(user);
  }

  async updateOne(
    intraId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.repository.findOne({
      intraId,
      isDeleted: false,
    });
    if (!user) return;
    if (updateUserDto.name !== null && updateUserDto.name !== undefined) {
      if (
        !(await this.repository.count({
          name: updateUserDto.name,
          isDeleted: false,
        }))
      )
        user.name = updateUserDto.name;
    }
    if (
      updateUserDto.profileImage !== null &&
      updateUserDto.profileImage !== undefined
    ) {
      user.profileImage = updateUserDto.profileImage;
    }
    if (
      updateUserDto.is2faEnabled !== null &&
      updateUserDto.is2faEnabled !== undefined
    ) {
      user.is2faEnabled = updateUserDto.is2faEnabled;
    }
    if (
      updateUserDto.introduction !== null &&
      updateUserDto.introduction !== undefined
    ) {
      user.introduction = updateUserDto.introduction;
    }
    if (user.isEmailValidated === false) {
      user.email = null;
      user.verificationCode = null;
    }
    await this.repository.getEntityManager().flush();
    return this.toDomain(user);
  }

  async updateStatusByIntraId(intraId: string, status: string): Promise<User> {
    const user = await this.repository.findOne({
      intraId,
      isDeleted: false,
    });
    if (!user) return;
    user.currentStatus = status;
    await this.repository.getEntityManager().flush();
    return this.toDomain(user);
  }

  async updateStatusById(id: string, status: string): Promise<User> {
    const user = await this.repository.findOne({
      id,
      isDeleted: false,
    });
    if (!user) return;
    user.currentStatus = status;
    await this.repository.getEntityManager().flush();
    return this.toDomain(user);
  }

  async updateTierAndExp(id: string, tier: TIER, exp: number): Promise<User> {
    const user = await this.repository.findOne({ id });
    if (!user) return;
    user.tier = tier as string;
    user.exp = exp;
    await this.repository.getEntityManager().flush();
    return this.toDomain(user);
  }

  async createOne(createUserDto: CreateUserDto): Promise<User> {
    if (
      await this.repository.count({
        intraId: createUserDto.intraId,
        isDeleted: false,
      })
    )
      return;
    const user = await this.repository.create({
      ...createUserDto,
      currentStatus: 'on-line',
      tier: TIER.Silver as string,
      exp: 0,
    });
    await this.repository.getEntityManager().flush();
    return this.toDomain(user);
  }

  async resetTwoFactorAuthValidation(intraId: string): Promise<void> {
    const user = await this.repository.findOne({
      intraId,
      isDeleted: false,
    });
    if (!user) return;
    user.is2faValidated = false;
    await this.repository.getEntityManager().flush();
  }

  async updateTwoFactorAuth(
    intraId: string,
    twoFactorAuth: TwoFactorAuthType,
  ): Promise<User> {
    const user = await this.repository.findOne({
      intraId,
      isDeleted: false,
    });
    if (!user) return;
    if (twoFactorAuth.email !== undefined) {
      user.email = twoFactorAuth.email;
    }
    if (
      twoFactorAuth.isEmailValidated !== undefined &&
      twoFactorAuth.isEmailValidated !== null
    ) {
      user.isEmailValidated = twoFactorAuth.isEmailValidated;
    }
    if (twoFactorAuth.code !== undefined) {
      user.verificationCode = twoFactorAuth.code;
    }
    if (
      twoFactorAuth.is2faValidated !== undefined &&
      twoFactorAuth.is2faValidated !== null
    ) {
      user.is2faValidated = twoFactorAuth.is2faValidated;
    }

    await this.repository.getEntityManager().flush();
    return this.toDomain(user);
  }

  private toDomain(userEntity: UserEntity): User {
    if (!userEntity) return;
    return new User({
      id: userEntity.id,
      intraId: userEntity.intraId,
      name: userEntity.name,
      profileImage: userEntity.profileImage,
      is2faEnabled: userEntity.is2faEnabled,
      email: userEntity.email,
      currentStatus: userEntity.currentStatus,
      introduction: userEntity.introduction,
      isEmailValidated: userEntity.isEmailValidated,
      is2faValidated: userEntity.is2faValidated,
      verificationCode: userEntity.verificationCode,
      tier: userEntity.tier,
      exp: userEntity.exp,
      isDeleted: userEntity.isDeleted,
      updatedAt: userEntity.updatedAt,
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
    userEntity.tier = user.tier;
    userEntity.exp = user.exp;
    userEntity.isEmailValidated = user.isEmailValidated;
    userEntity.isDeleted = user.isDeleted;

    return userEntity;
  }
}
