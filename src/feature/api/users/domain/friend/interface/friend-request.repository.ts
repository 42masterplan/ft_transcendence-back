import { FriendRequest } from '../friend-request';

export interface FriendRequestRepository {
  save({ primaryUserId, targetUserId }): Promise<void>;
  findManyByPrimaryUserIdTargetUserId({
    primaryUserId,
    targetUserId,
  }): Promise<FriendRequest[]>;
  update(friendRequest: FriendRequest): Promise<FriendRequest>;
}

export const FriendRequestRepository = Symbol('FRIEND_REQUEST_REPOSITORY');
