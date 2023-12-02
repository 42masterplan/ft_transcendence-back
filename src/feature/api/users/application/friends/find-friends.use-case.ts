import { Inject, Injectable } from '@nestjs/common';
import { FriendRepository } from '../../domain/friend/interface/friend.repository';
import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user.repository';

@Injectable()
export class FindFriendsUseCase {
  constructor(
    @Inject(FriendRepository)
    private readonly repository: FriendRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<User[]> {
    const friends = await this.repository.findManyByMyId(id);
    const friendPromises = friends.map(
      async (friend) => await this.userRepository.findOneById(friend.friendId),
    );

    return await Promise.all(friendPromises);
  }
}
