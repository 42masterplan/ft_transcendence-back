import { Injectable } from '@nestjs/common';
import { UsersUseCases } from './application/use-case/users.use-case';
import { User } from './domain/user';
import { CreateUserDto } from './presentation/dto/create-user.dto';
import path from 'node:path';

@Injectable()
export class UsersService {
  constructor(private readonly usersUseCases: UsersUseCases) {}

  async saveOne(createUserDto: CreateUserDto): Promise<User> {
    // console.log('name:' + createUserDto.name);
    console.log('profileImage:' + createUserDto.profileImage);
    console.log('introduction:' + createUserDto.introduction);
    console.log('is2faEnabled:' + createUserDto.is2faEnabled);
    return await this.usersUseCases.saveOne(createUserDto);
  }

  async createOne(createUserDto: CreateUserDto): Promise<User> {
    return await this.usersUseCases.createOne(createUserDto);
  }
  
  async findOneByIntraId(intraId: string): Promise<User> {
    return await this.usersUseCases.findOneByIntraId(intraId);
  }

  async isDuplicatedName(name: string): Promise<boolean> {
    const user = await this.usersUseCases.findOneByName(name);
    if (user)
      return true;
    return false;
  }
}
