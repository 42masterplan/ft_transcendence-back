import { NotificationGateway } from '../../../notification/presentation/notification.gateway';
import { FriendRequestRepository } from '../../domain/friend/interface/friend-request.repository';
import { UserRepository } from '../../domain/user.repository';
import { BlockedUserUseCase } from '../use-case/blocked-user.use-case';
import { FriendUseCase } from './friend.use-case';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class CreateFriendRequestUseCase {
  private readonly logger = new Logger(CreateFriendRequestUseCase.name);

  constructor(
    @Inject(FriendRequestRepository)
    private readonly repository: FriendRequestRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly friendUseCase: FriendUseCase,
    private readonly blockedUserUseCase: BlockedUserUseCase,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async execute({
    primaryUserId,
    targetUserId,
  }: {
    primaryUserId: string;
    targetUserId: string;
  }): Promise<void> {
    if (primaryUserId === targetUserId) return;
    if (await this.hasExistingFriendRequest({ primaryUserId, targetUserId })) {
      return;
    }
    if (
      await this.friendUseCase.isFriend({
        myId: primaryUserId,
        friendId: targetUserId,
      })
    )
      return;
    if (
      await this.blockedUserUseCase.someoneBlocked({
        myId: primaryUserId,
        targetId: targetUserId,
      })
    )
      return;

    const targetUser = await this.userRepository.findOneById(targetUserId);

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }
    this.logger.log(targetUser);
    const friendRequest = await this.repository.save({
      primaryUserId,
      targetUserId,
    });
    this.notificationGateway.handleNewFriendRequest(targetUserId);

    return friendRequest;
  }

  async hasExistingFriendRequest({
    primaryUserId,
    targetUserId,
  }: {
    primaryUserId: string;
    targetUserId: string;
  }): Promise<boolean> {
    const friendRequests =
      await this.repository.findManyByPrimaryUserIdTargetUserId({
        primaryUserId,
        targetUserId,
      });
    this.logger.log(friendRequests);
    const friendRequest = friendRequests.filter((friendRequest) =>
      friendRequest.isAcceptedNull(),
    );

    if (friendRequest.length > 0) {
      return true;
    }

    return false;
  }
}
