import { FriendRequestRepository } from '../../domain/friend/interface/friend-request.repository';
import { UserRepository } from '../../domain/user.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CreateFriendRequestUseCase {
  private readonly logger = new Logger(CreateFriendRequestUseCase.name);

  constructor(
    @Inject(FriendRequestRepository)
    private readonly repository: FriendRequestRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    primaryUserId,
    targetUserId,
  }: {
    primaryUserId: string;
    targetUserId: string;
  }): Promise<void> {
    if (primaryUserId === targetUserId) return;
    if (await this.hasExistingFriendRequest({ primaryUserId, targetUserId })) {
      return;
    }
    // TODO: 이미 친구 여부 or Block 된 사람인 지 확인

    const targetUser = await this.userRepository.findOneById(targetUserId);

    if (!targetUser) {
      throw new Error('Target user not found');
    }
    this.logger.log(targetUser);
    return this.repository.save({
      primaryUserId,
      targetUserId,
    });
  }

  async hasExistingFriendRequest({
    primaryUserId,
    targetUserId,
  }: {
    primaryUserId: string;
    targetUserId: string;
  }): Promise<boolean> {
    const friendRequests =
      await this.repository.findManyByPrimaryUserIdTargetUserId({
        primaryUserId,
        targetUserId,
      });
    this.logger.log(friendRequests);
    const friendRequest = friendRequests.filter((friendRequest) =>
      friendRequest.isAcceptedNull(),
    );

    if (friendRequest.length > 0) {
      return true;
    }

    return false;
  }
}
