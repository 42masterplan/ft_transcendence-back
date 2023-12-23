import { User } from '../domain/user';
import { UserRepository } from '../domain/user.repository';
import { CreateUserDto } from '../presentation/dto/create-user.dto';
import { UpdateUserDto } from '../presentation/dto/update-user.dto';
import { TwoFactorAuthType } from '../presentation/type/two-factor-auth.type';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: EntityRepository<UserEntity>,
  ) {}

  async findOneById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ id });
    if (!user) return null;

    return this.toDomain(user);
  }

  async findOneByName(name: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ name });
    if (!user) return null;

    return this.toDomain(user);
  }

  async findOneByIntraId(intraId: string): Promise<User> {
    const user = await this.userRepository.findOne({ intraId });
    if (user) return this.toDomain(user);
  }

  async updateOne(
    intraId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ intraId });
    if (updateUserDto.name !== null && updateUserDto.name !== undefined) {
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
    await this.userRepository.getEntityManager().flush();
    return this.toDomain(user);
  }

  async createOne(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(createUserDto);
    await this.userRepository.getEntityManager().flush();
    return this.toDomain(user);
  }

  async updateTwoFactor(
    intraId: string,
    twoFactor: TwoFactorAuthType,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ intraId });
    if (twoFactor.email !== undefined) {
      user.email = twoFactor.email;
      console.log(twoFactor.email);
    }
    if (
      twoFactor.isEmailValidated !== undefined &&
      twoFactor.isEmailValidated !== null
    ) {
      user.isEmailValidated = twoFactor.isEmailValidated;
      console.log(twoFactor.isEmailValidated);
    }
    if (twoFactor.code !== undefined) {
      user.verificationCode = twoFactor.code;
      console.log(twoFactor.code);
    }
    await this.userRepository.getEntityManager().flush();
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
      isEmailValidated: userEntity.isEmailValidated,
      is2faValidated: userEntity.is2faValidated,
      verificationCode: userEntity.verificationCode,
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
    userEntity.isEmailValidated = user.isEmailValidated;
    userEntity.isDeleted = user.isDeleted;

    return userEntity;
  }
}
