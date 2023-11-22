import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user.repository';
import { UserEntity } from '../../infrastructure/user.entity';
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
