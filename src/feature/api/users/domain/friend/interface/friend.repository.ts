import { FriendEntity } from '../../../infrastructure/friend.entity';

export interface FriendRepository {
  findManyByMyId(myId: string): Promise<FriendEntity[]>;
}
