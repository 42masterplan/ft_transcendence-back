import { BlockedUserRepository } from '../../domain/friend/interface/blocked-user.repository';
import { CheckFriendUseCase } from '../friends/check-friend.use-case';
import { DeleteFriendUseCase } from '../friends/delete-friend.use-case';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class BlockedUserUseCase {
  constructor(
    @Inject(BlockedUserRepository)
    private readonly repository: BlockedUserRepository,
    private readonly checkFriendUseCase: CheckFriendUseCase,
    private readonly deleteFriendUseCase: DeleteFriendUseCase,
  ) {}

  async block({ myId, targetId }: { myId: string; targetId: string }) {
    if (await this.repository.alreadyBlock({ myId, targetId })) return;

    if (await this.checkFriendUseCase.execute({ myId, friendId: targetId })) {
      await this.deleteFriendUseCase.execute({
        myId: myId,
        friendId: targetId,
      });
    }
    await this.repository.block({ myId, targetId });
  }
}
