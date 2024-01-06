import { FriendRepository } from '../../domain/friend/interface/friend.repository';
import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

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
    const friendPromises = friends.map(async (friend) => {
      const user = await this.userRepository.findOneById(friend.friendId);
      if (!user) throw new NotFoundException('There is no such user(friend).');
      return user;
    });

    return await Promise.all(friendPromises);
  }
}
