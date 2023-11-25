import { Injectable } from '@nestjs/common';
import { UsersUseCases } from './application/use-case/users.use-case';
import { CreateUserDto } from './presentation/dto/create-user.dto';
import { User } from './domain/user';

@Injectable()
export class UsersService {
  constructor(private readonly usersUseCases: UsersUseCases) {}

  async saveOne(createUserDto: CreateUserDto): Promise<User> {
    console.log('name:' + createUserDto.name);
    console.log('profileImage:' + createUserDto.profileImage);
    console.log('introduction:' + createUserDto.introduction);
    console.log('is2faEnabled:' + createUserDto.is2faEnabled);
    return await this.usersUseCases.saveOne(createUserDto);
  }

  async isExist({ name }: { name?: string }): Promise<boolean> {
    // if (name) return await this.usersUseCases.isExistByName(name); TODO: save, try-catch
    return false;
  }

  async isTwoFactorEnabled({ name }: { name?: string }): Promise<boolean> {
    // if (name) return await this.usersUseCases.
    return true;
  }
}
