import { FriendRequest } from '../../domain/friend/friend-request';
import { FriendRequestRepository } from '../../domain/friend/interface/friend-request.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FriendRequestUseCase {
  constructor(
    @Inject(FriendRequestRepository)
    private readonly repository: FriendRequestRepository,
  ) {}

  async findMyFriendsRequests(myId: string): Promise<FriendRequest[]> {
    const myFriendsRequests =
      await this.repository.findManyByPrimaryUserId(myId);

    return myFriendsRequests.filter(
      (myFriendRequest) => myFriendRequest.isAccepted === null,
    );
  }

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
