import { UsersUseCases } from './application/use-case/users.use-case';
import { User } from './domain/user';
import { CreateUserDto } from './presentation/dto/create-user.dto';
import { UpdateUserDto } from './presentation/dto/update-user.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private readonly usersUseCases: UsersUseCases) {}

  async updateOne(intraId: string, updateUserDto: UpdateUserDto) {
    return await this.usersUseCases.updateOne(intraId, updateUserDto);
  }

  async createOne(createUserDto: CreateUserDto): Promise<User> {
    return await this.usersUseCases.createOne(createUserDto);
  }

  async findOneByIntraId(intraId: string): Promise<User> {
    return await this.usersUseCases.findOneByIntraId(intraId);
  }

  async isDuplicatedName(name: string): Promise<boolean> {
    const user = await this.usersUseCases.findOneByName(name);
    if (user) return true;
    return false;
  }

  async createRandomCode(intraId: string, email: string): Promise<number> {
    const randomCode = Math.floor(Math.random() * 899999) + 100000;
    await this.usersUseCases.updateTwoFactorWithEmail(
      intraId,
      email,
      randomCode,
    );
    return randomCode;
  }
}
