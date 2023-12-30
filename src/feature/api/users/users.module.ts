import { MailModule } from '../mail/mail.module';
import { NotificationModule } from '../notification/notification.module';
import { CreateFriendRequestUseCase } from './application/friends/create-friend-request.use-case';
import { FindAcceptableFriendRequestUseCase } from './application/friends/find-acceptable-friend-request.use-case';
import { FindFriendsUseCase } from './application/friends/find-friends.use-case';
import { FriendRequestUseCase } from './application/friends/friend-request.use-case';
import { FriendUseCase } from './application/friends/friend.use-case';
import { BlockedUserUseCase } from './application/use-case/blocked-user.use-case';
import { FindBlockedUserUseCase } from './application/use-case/find-blocked-user.use-case';
import { UsersUseCase } from './application/use-case/users.use-case';
import { BlockedUserRepository } from './domain/friend/interface/blocked-user.repository';
import { FriendRequestRepository } from './domain/friend/interface/friend-request.repository';
import { FriendRepository } from './domain/friend/interface/friend.repository';
import { UserRepository } from './domain/user.repository';
import { BlockedUserEntity } from './infrastructure/blocked-user.entity';
import { FriendRequestEntity } from './infrastructure/friend-request.entity';
import { FriendEntity } from './infrastructure/friend.entity';
import { BlockedUserRepositoryImpl } from './infrastructure/repositories/blocked-user.repository.impl';
import { FriendRequestRepositoryImpl } from './infrastructure/repositories/friend-request.repository.impl';
import { FriendRepositoryImpl } from './infrastructure/repositories/friend.repository.impl';
import { UserEntity } from './infrastructure/user.entity';
import { UserRepositoryImpl } from './infrastructure/user.repository.impl';
import { FriendsController } from './presentation/controller/friends.controller';
import { UsersController } from './presentation/controller/users.controller';
import { UsersService } from './users.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      UserEntity,
      FriendEntity,
      FriendRequestEntity,
      BlockedUserEntity,
    ]),
    MailModule,
    forwardRef(() => NotificationModule),
  ],
  controllers: [UsersController, FriendsController],
  providers: [
    /** application */
    UsersUseCase,
    UsersService,

    BlockedUserUseCase,
    FindBlockedUserUseCase,

    FriendUseCase,
    FindFriendsUseCase,

    CreateFriendRequestUseCase,
    FriendRequestUseCase,
    FindAcceptableFriendRequestUseCase,

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
    {
      provide: BlockedUserRepository,
      useClass: BlockedUserRepositoryImpl,
    },
  ],
  exports: [UsersUseCase, UsersService, UserRepository, FriendUseCase, FriendRepository],
})
export class UsersModule {}
