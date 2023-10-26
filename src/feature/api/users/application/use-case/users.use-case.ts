import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user';

@Injectable()
export class UsersUseCases {
  constructor(
    @Inject(UserRepository)
    private readonly repository: UserRepository,
  ) {}

  findOne(id: number): Promise<User> {
    return this.repository.findOne(id);
  }
}
