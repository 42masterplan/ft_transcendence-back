import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user.repository';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';

@Injectable()
export class UsersUseCases {
  constructor(
    @Inject(UserRepository)
    private readonly repository: UserRepository,
  ) {}

  findOne(id: string): Promise<User> {
    return this.repository.findOneById(id);
  }

  async findOneByName(name: string): Promise<User> {
    return this.repository.findOneByName(name);
  }

  async findOneByIntraId(intraId: string): Promise<User> {
    return this.repository.findOneByIntraId(intraId);
  }

  async updateOne(
    intraId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.repository.updateOne(intraId, updateUserDto);
  }

  async createOne(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.repository.createOne(createUserDto);
    } catch (e) {
      throw new ConflictException(e, 'Create user failed.');
    }
  }

  async isTwoFactorEnabled(intraId: string): Promise<boolean> {
    intraId;
    return true;
    // return await this.repository.isTw;
  }
}
