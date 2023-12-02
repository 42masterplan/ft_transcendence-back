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

    // return [
    //   {
    //     id: '1',
    //     profileImage: 'http://localhost:8080/resources/cat_kickBoard.svg',
    //     name: 'OnlineUser1',
    //     currentStatus: 'on-line',
    //     introduction: "Hello, I'm User1. Nice to meet you!"
    //   },
    //   {
    //     id: '2',
    //     profileImage: 'http://localhost:8080/resources/sloth_health.svg',
    //     name: 'OfflineUser1',
    //     currentStatus: 'off-line',
    //     introduction: "Hello, I'm User2. Nice to meet you!"
    //   },
    //   {
    //     id: '3',
    //     profileImage: 'http://localhost:8080/resources/crocodile_health.svg',
    //     name: 'InGameUser3',
    //     currentStatus: 'in-game',
    //     introduction: "Hello, I'm User3. Nice to meet you!"
    //   },
    //   {
    //     id: '4',
    //     profileImage: 'http://localhost:8080/resources/dog_body.svg',
    //     name: 'OnlineUser4',
    //     currentStatus: 'on-line',
    //     introduction: "Hello, I'm User4. Nice to meet you!"
    //   },
    //   {
    //     id: '5',
    //     profileImage: 'http://localhost:8080/resources/dog_boxing.svg',
    //     name: 'User5',
    //     currentStatus: 'off-line',
    //     introduction: "Hello, I'm User5. Nice to meet you!"
    //   }
    // ];
  }
}
