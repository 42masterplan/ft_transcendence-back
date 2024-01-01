import { BlockedUserRepository } from '../../domain/friend/interface/blocked-user.repository';
import { FriendUseCase } from '../friends/friend.use-case';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class BlockedUserUseCase {
  constructor(
    @Inject(BlockedUserRepository)
    private readonly repository: BlockedUserRepository,
    private readonly friendUseCase: FriendUseCase,
  ) {}

  async block({ myId, targetId }: { myId: string; targetId: string }) {
    if (await this.repository.alreadyBlock({ myId, targetId })) return;

    if (await this.friendUseCase.isFriend({ myId, friendId: targetId })) {
      await this.friendUseCase.delete({
        myId: myId,
        friendId: targetId,
      });
    }
    await this.repository.block({ myId, targetId });
  }

  async unblock({ myId, targetId }: { myId: string; targetId: string }) {
    if (!(await this.repository.alreadyBlock({ myId, targetId }))) return;
    await this.repository.unblock({ myId, targetId });
  }

  async someoneBlocked({ myId, targetId }: { myId: string; targetId: string }) {
    if (
      (await this.repository.alreadyBlock({ myId, targetId })) ||
      (await this.repository.alreadyBlock({ myId: targetId, targetId: myId }))
    )
      return true;
    return false;
  }

  async isBlocked({ myId, targetId }: { myId: string; targetId: string }) {
    if (await this.repository.alreadyBlock({ myId, targetId })) return true;
    return false;
  }
}
