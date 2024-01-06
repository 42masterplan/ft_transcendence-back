import { FriendRepository } from '../../domain/friend/interface/friend.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FriendUseCase {
  constructor(
    @Inject(FriendRepository) private readonly repository: FriendRepository,
  ) {}

  async create({
    myId,
    friendId,
  }: {
    myId: string;
    friendId: string;
  }): Promise<boolean> {
    if (
      await this.repository.createFriend({
        myId,
        friendId,
      })
    )
      return true;
    return false;
  }

  async delete({
    myId,
    friendId,
  }: {
    myId: string;
    friendId: string;
  }): Promise<boolean> {
    if (
      await this.repository.deleteFriend({
        myId,
        friendId,
      })
    )
      return true;
    return false;
  }

  async isFriend({
    myId,
    friendId,
  }: {
    myId: string;
    friendId: string;
  }): Promise<boolean> {
    const friends = await this.repository.findManyByMyId(myId);
    const isFriend = friends.some((friend) => friend.friendId === friendId);
    return isFriend;
  }
}
