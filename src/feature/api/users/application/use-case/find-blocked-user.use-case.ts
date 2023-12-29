import { BlockedUserRepository } from '../../domain/friend/interface/blocked-user.repository';
import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindBlockedUserUseCase {
  constructor(
    @Inject(BlockedUserRepository)
    private readonly repository: BlockedUserRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<User[]> {
    const blocked = await this.repository.findManyByMyId(id);
    const blockedPromises = blocked.map(
      async (block) =>
        await this.userRepository.findOneById(block.targetUserId),
    );

    return await Promise.all(blockedPromises);
  }
}
