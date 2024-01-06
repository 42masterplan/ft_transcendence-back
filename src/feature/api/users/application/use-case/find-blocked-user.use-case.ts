import { BlockedUserRepository } from '../../domain/friend/interface/blocked-user.repository';
import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

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
    const blockedPromises = blocked.map(async (block) => {
      const user = await this.userRepository.findOneById(block.targetUserId);
      if (!user) throw new NotFoundException('There is no such user(blocked).');
      return user;
    });

    return await Promise.all(blockedPromises);
  }
}
