import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user';
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

  async saveOne(createUserDto: CreateUserDto): Promise<User> {
    return await this.repository.saveOne(createUserDto);
  }

  async isTwoFactorEnabled(intraId: string): Promise<boolean> {
    intraId;
    return true;
    // return await this.repository.isTw;
  }
}
