import { Friend } from '../friend';

export interface FriendRepository {
  findManyByMyId(myId: string): Promise<Friend[]>;
  deleteMyFriend({
    myId,
    friendId,
  }: {
    myId: string;
    friendId: string;
  }): Promise<Friend>;
}

export const FriendRepository = Symbol('FRIEND_REPOSITORY');
