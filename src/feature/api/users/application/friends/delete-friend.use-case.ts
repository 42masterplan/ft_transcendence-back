import { Friend } from '../../domain/friend/friend';
import { FriendRepository } from '../../domain/friend/interface/friend.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteFriendUseCase {
  constructor(
    @Inject(FriendRepository) private readonly repository: FriendRepository,
  ) {}

  execute({
    myId,
    friendId,
  }: {
    myId: string;
    friendId: string;
  }): Promise<Friend> {
    return this.repository.deleteMyFriend({
      myId,
      friendId,
    });
  }
}
