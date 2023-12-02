import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { FindFriendsUseCase } from './application/friends/find-friends.use-case';
import { UsersUseCases } from './application/use-case/users.use-case';
import { FriendRepository } from './domain/friend/interface/friend.repository';
import { UserRepository } from './domain/user.repository';
import { FriendEntity } from './infrastructure/friend.entity';
import { FriendRepositoryImpl } from './infrastructure/repositories/friend.repository';
import { UserRepositoryImpl } from './infrastructure/user.repository.impl';
import { FriendsController } from './presentation/controller/friends.controller';
import { UsersController } from './presentation/controller/users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [MikroOrmModule.forFeature([FriendEntity]), MailModule],
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

    /** domain */
    {
      provide: FriendRepository,
      useClass: FriendRepositoryImpl,
    },
  ],
  exports: [UsersUseCases, UsersService],
})
export class UsersModule {}
