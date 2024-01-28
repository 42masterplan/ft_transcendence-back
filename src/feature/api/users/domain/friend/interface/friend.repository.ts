import { Friend } from '../friend';

export interface FriendRepository {
  findManyByMyId(myId: string): Promise<Friend[]>;
  deleteFriend({
    myId,
    friendId,
  }: {
    myId: string;
    friendId: string;
  }): Promise<Friend>;
  createFriend({
    myId,
    friendId,
  }: {
    myId: string;
    friendId: string;
  }): Promise<Friend>;
}

export const FriendRepository = Symbol('FRIEND_REPOSITORY');
