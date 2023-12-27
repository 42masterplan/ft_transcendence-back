import { FriendRepository } from '../../domain/friend/interface/friend.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CheckFriendUseCase {
  constructor(
    @Inject(FriendRepository) private readonly repository: FriendRepository,
  ) {}

  async execute({
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
