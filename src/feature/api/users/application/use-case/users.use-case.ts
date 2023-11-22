import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user';
import { UserEntity } from '../../infrastructure/user.entity';
import { use } from 'passport';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';

@Injectable()
export class UsersUseCases {
  constructor(
    @Inject(UserRepository)
    private readonly repository: UserRepository,
  ) {}

  findOne(id: string): Promise<UserEntity> {
    return this.repository.findOne(id);
  }

  saveOne(createUserDto: CreateUserDto): Promise<User> {
    return this.repository.save(createUserDto);
  }
}
