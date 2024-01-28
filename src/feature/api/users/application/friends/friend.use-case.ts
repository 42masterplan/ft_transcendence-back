import { Friend } from '../../domain/friend/friend';
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
  }): Promise<Friend> {
    return await this.repository.createFriend({
      myId,
      friendId,
    });
  }

  async delete({
    myId,
    friendId,
  }: {
    myId: string;
    friendId: string;
  }): Promise<Friend> {
    return await this.repository.deleteFriend({
      myId,
      friendId,
    });
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
