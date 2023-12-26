import { FriendRequest } from '../../domain/friend/friend-request';
import { FriendRequestRepository } from '../../domain/friend/interface/friend-request.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FriendRequestUseCase {
  constructor(
    @Inject(FriendRequestRepository)
    private readonly repository: FriendRequestRepository,
  ) {}

  async acceptFriendRequest({
    primaryUserId,
    targetUserId,
  }: {
    primaryUserId: string;
    targetUserId: string;
  }) {
    const friendRequests =
      await this.repository.findManyByPrimaryUserIdTargetUserId({
        primaryUserId,
        targetUserId,
      });

    const acceptedFriendRequest =
      this.getAcceptableFriendRequest(friendRequests);

    if (!acceptedFriendRequest) {
      throw new Error('Friend request not found');
    }

    acceptedFriendRequest.updateIsAccepted(true);

    // TODO: Friend Request update;
    // TODO: Freind 2개 생성;
    // TODO: DM 방 생성
    return await this.repository.update(acceptedFriendRequest);
  }

  async rejectFriendRequest({
    primaryUserId,
    targetUserId,
  }: {
    primaryUserId: string;
    targetUserId: string;
  }) {
    const friendRequests =
      await this.repository.findManyByPrimaryUserIdTargetUserId({
        primaryUserId,
        targetUserId,
      });

    const acceptedFriendRequest =
      this.getAcceptableFriendRequest(friendRequests);

    if (!acceptedFriendRequest) {
      throw new Error('Friend request not found');
    }

    acceptedFriendRequest.updateIsAccepted(false);

    return await this.repository.update(acceptedFriendRequest);
  }

  getAcceptableFriendRequest(
    friendRequests: FriendRequest[],
  ): FriendRequest | null {
    const acceptedFriendRequest = friendRequests.filter(
      (friendRequest) => friendRequest.isAccepted === null,
    );

    if (acceptedFriendRequest.length > 0) {
      return acceptedFriendRequest[0];
    }

    return null;
  }
}
