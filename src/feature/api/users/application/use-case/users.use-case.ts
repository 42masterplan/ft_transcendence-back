import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user.repository';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';

@Injectable()
export class UsersUseCases {
  constructor(
    @Inject(UserRepository)
    private readonly repository: UserRepository,
  ) {}

  findOne(id: string): Promise<User> {
    return this.repository.findOneById(id);
  }

  async findOneByIntraId(id: string): Promise<User> {
    return this.repository.findOneByIntraId(id);
  }

  async saveOne(createUserDto: CreateUserDto): Promise<User> {
    return await this.repository.saveOne(createUserDto);
  }

  async createOne(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.repository.saveOne(createUserDto);
    }
    catch (e) {
      throw new ConflictException(e, 'Create user failed.');
    }
  }

  async isTwoFactorEnabled(intraId: string): Promise<boolean> {
    intraId;
    return true;
    // return await this.repository.isTw;
  }
}
