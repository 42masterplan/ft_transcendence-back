import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { FindFriendsUseCase } from './application/friends/find-friends.use-case';
import { UsersUseCases } from './application/use-case/users.use-case';
import { UserRepository } from './domain/user.repository';
import { FriendEntity } from './infrastructure/friend.entity';
import { UserRepositoryImpl } from './infrastructure/user.repository.impl';
import { FriendsController } from './presentation/controller/friends.controller';
import { UsersController } from './presentation/controller/users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [MikroOrmModule.forFeature([FriendEntity])],
  controllers: [UsersController, FriendsController],
  providers: [
    /** application */
    UsersUseCases,
    FindFriendsUseCase,
    UsersService,

    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [UsersUseCases],
})
export class UsersModule {}
