import { FriendRequest } from '../friend-request';

export interface FriendRequestRepository {
  save({ primaryUserId, targetUserId }): Promise<void>;
  findManyByPrimaryUserId(primaryUserId: string): Promise<FriendRequest[]>;
  findManyByTargetUserId(primaryUserId: string): Promise<FriendRequest[]>;
  findManyByPrimaryUserIdTargetUserId({
    primaryUserId,
    targetUserId,
  }): Promise<FriendRequest[]>;
  findOneByRequestId({ requestId }): Promise<FriendRequest>;
  update(friendRequest: FriendRequest): Promise<FriendRequest>;
}

export const FriendRequestRepository = Symbol('FRIEND_REQUEST_REPOSITORY');
