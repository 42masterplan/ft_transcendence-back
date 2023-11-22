import { Module } from '@nestjs/common';
import { UsersUseCases } from './application/use-case/users.use-case';
import { UserRepository } from './domain/user.repository';
import { UserRepositoryImpl } from './infrastructure/user.repository.impl';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [
    UsersUseCases,
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [UsersUseCases],
})
export class UsersModule {}
