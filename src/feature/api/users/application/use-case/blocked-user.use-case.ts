import { NotificationGateway } from '../../../notification/presentation/notification.gateway';
import { BlockedUserRepository } from '../../domain/friend/interface/blocked-user.repository';
import { FriendRequestUseCase } from '../friends/friend-request.use-case';
import { FriendUseCase } from '../friends/friend.use-case';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class BlockedUserUseCase {
  constructor(
    @Inject(BlockedUserRepository)
    private readonly repository: BlockedUserRepository,
    private readonly friendUseCase: FriendUseCase,
    private readonly friendRequestUseCase: FriendRequestUseCase,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async block({ myId, targetId }: { myId: string; targetId: string }) {
    if (await this.repository.alreadyBlock({ myId, targetId })) return;

    if (await this.friendUseCase.isFriend({ myId, friendId: targetId })) {
      await this.friendUseCase.delete({
        myId: myId,
        friendId: targetId,
      });
    }

    const requests = await this.friendRequestUseCase.getFriendRequestBetween({
      myId,
      targetId,
    });
    for await (const request of requests) {
      await this.friendRequestUseCase.rejectFriendRequest({
        requestId: request.id,
      });
    }

    this.notificationGateway.handleSocialUpdate(myId);
    this.notificationGateway.handleSocialUpdate(targetId);
    await this.repository.block({ myId, targetId });
  }

  async unblock({ myId, targetId }: { myId: string; targetId: string }) {
    if (!(await this.repository.alreadyBlock({ myId, targetId }))) return;
    await this.repository.unblock({ myId, targetId });
  }

  async someoneBlocked({ myId, targetId }: { myId: string; targetId: string }) {
    if (
      (await this.repository.alreadyBlock({ myId, targetId })) ||
      (await this.repository.alreadyBlock({ myId: targetId, targetId: myId }))
    )
      return true;
    return false;
  }

  async isBlocked({ myId, targetId }: { myId: string; targetId: string }) {
    if (await this.repository.alreadyBlock({ myId, targetId })) return true;
    return false;
  }
}
