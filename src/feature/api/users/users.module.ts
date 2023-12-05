import { MailModule } from '../mail/mail.module';
import { CreateFriendRequestUseCase } from './application/friends/create-friend-request.use-case';
import { FindFriendsUseCase } from './application/friends/find-friends.use-case';
import { UsersUseCases } from './application/use-case/users.use-case';
import { FriendRequestRepository } from './domain/friend/interface/friend-request.repository';
import { FriendRepository } from './domain/friend/interface/friend.repository';
import { UserRepository } from './domain/user.repository';
import { FriendRequestEntity } from './infrastructure/friend-request.entity';
import { FriendEntity } from './infrastructure/friend.entity';
import { FriendRequestRepositoryImpl } from './infrastructure/repositories/friend-request.repository';
import { FriendRepositoryImpl } from './infrastructure/repositories/friend.repository.impl';
import { UserRepositoryImpl } from './infrastructure/user.repository.impl';
import { FriendsController } from './presentation/controller/friends.controller';
import { UsersController } from './presentation/controller/users.controller';
import { UsersService } from './users.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MikroOrmModule.forFeature([FriendEntity, FriendRequestEntity]),
    MailModule,
  ],
  controllers: [UsersController, FriendsController],
  providers: [
    /** application */
    UsersUseCases,
    UsersService,

    FindFriendsUseCase,
    CreateFriendRequestUseCase,

    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },

    /** domain */
    {
      provide: FriendRepository,
      useClass: FriendRepositoryImpl,
    },
    {
      provide: FriendRequestRepository,
      useClass: FriendRequestRepositoryImpl,
    },
  ],
  exports: [UsersUseCases, UsersService],
})
export class UsersModule {}
