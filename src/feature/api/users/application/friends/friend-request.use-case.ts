import { DmUseCase } from '../../../notification/application/dm.use-case';
import { NotificationGateway } from '../../../notification/presentation/notification.gateway';
import { FriendRequest } from '../../domain/friend/friend-request';
import { FriendRequestRepository } from '../../domain/friend/interface/friend-request.repository';
import { FriendUseCase } from './friend.use-case';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FriendRequestUseCase {
  constructor(
    @Inject(FriendRequestRepository)
    private readonly repository: FriendRequestRepository,
    private readonly friendUseCase: FriendUseCase,
    private readonly dmUseCase: DmUseCase,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async acceptFriendRequest({ requestId }: { requestId: number }) {
    const friendRequest = await this.repository.findOneByRequestId({
      requestId,
    });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    friendRequest.updateIsAccepted(true);

    const myId = friendRequest.targetUserId;
    const friendId = friendRequest.primaryUserId;
    await this.repository.update(friendRequest);
    if (await this.friendUseCase.isFriend({ myId, friendId })) return;

    if (
      await this.friendUseCase.create({
        myId,
        friendId,
      })
    )
      return;

    await this.dmUseCase.createDm(myId, friendId);
    this.notificationGateway.handleSocialUpdate(myId);
    this.notificationGateway.handleSocialUpdate(friendId);

    return friendRequest;
  }

  async rejectFriendRequest({ requestId }: { requestId: number }) {
    const friendRequest = await this.repository.findOneByRequestId({
      requestId,
    });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    friendRequest.updateIsAccepted(false);

    return await this.repository.update(friendRequest);
  }

  async getFriendRequestBetween({
    myId,
    targetId,
  }: {
    myId: string;
    targetId: string;
  }): Promise<FriendRequest[]> {
    const acceptableRequestsByMe =
      await this.repository.findManyByPrimaryUserIdTargetUserId({
        primaryUserId: myId,
        targetUserId: targetId,
      });
    const acceptableRequestsToMe =
      await this.repository.findManyByPrimaryUserIdTargetUserId({
        primaryUserId: myId,
        targetUserId: targetId,
      });

    const requests = acceptableRequestsByMe.filter((friendRequest) =>
      acceptableRequestsToMe.includes(friendRequest),
    );
    return requests;
  }
}
