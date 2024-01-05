import { DmUseCase } from '../../../notification/application/dm.use-case';
import { NotificationGateway } from '../../../notification/presentation/notification.gateway';
import { FriendRequest } from '../../domain/friend/friend-request';
import { FriendRequestRepository } from '../../domain/friend/interface/friend-request.repository';
import { FriendUseCase } from './friend.use-case';
import { Inject, Injectable } from '@nestjs/common';

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
      throw new Error('Friend request not found');
    }

    friendRequest.updateIsAccepted(true);

    const myId = friendRequest.targetUserId;
    const friendId = friendRequest.primaryUserId;
    await this.friendUseCase.create({
      myId,
      friendId,
    });

    await this.dmUseCase.createDm(myId, friendId);
    this.notificationGateway.handleSocialUpdate(myId);
    this.notificationGateway.handleSocialUpdate(friendId);

    return await this.repository.update(friendRequest);
  }

  async rejectFriendRequest({ requestId }: { requestId: number }) {
    const friendRequest = await this.repository.findOneByRequestId({
      requestId,
    });

    if (!friendRequest) {
      throw new Error('Friend request not found');
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
    const friendRequestsByMe =
      await this.repository.findManyByPrimaryUserIdTargetUserId({
        primaryUserId: myId,
        targetUserId: targetId,
      });
    const friendRequestsToMe =
      await this.repository.findManyByPrimaryUserIdTargetUserId({
        primaryUserId: myId,
        targetUserId: targetId,
      });
    const acceptableRequestsByMe = friendRequestsByMe.filter(
      (friendRequest) => friendRequest.isAccepted === null,
    );
    const acceptableRequestsToMe = friendRequestsToMe.filter(
      (friendRequest) => friendRequest.isAccepted === null,
    );

    const requests = acceptableRequestsByMe.filter((friendRequest) =>
      acceptableRequestsToMe.includes(friendRequest),
    );
    return requests;
  }
}
