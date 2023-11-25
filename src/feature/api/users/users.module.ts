import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersUseCases } from './application/use-case/users.use-case';
import { UserRepositoryImpl } from './infrastructure/user.repository.impl';
import { UserRepository } from './domain/user.repository';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersUseCases,
    UsersService,
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [UsersUseCases],
})
export class UsersModule {}
