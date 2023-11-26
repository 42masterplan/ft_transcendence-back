import { Module } from '@nestjs/common';
import { UsersUseCases } from './application/use-case/users.use-case';
import { UserRepository } from './domain/user.repository';
import { UserRepositoryImpl } from './infrastructure/user.repository.impl';
import { FriendsController } from './presentation/controller/friends.controller';
import { UsersController } from './presentation/controller/users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, FriendsController],
  providers: [
    UsersUseCases,
    UsersService,
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [UsersUseCases, UsersService],
})
export class UsersModule {}
