import { CreateFriendRequestUseCase } from '../../application/friends/create-friend-request.use-case';
import { FindFriendsUseCase } from '../../application/friends/find-friends.use-case';
import { FindFriendViewModel } from '../view-models/friends/find-friend.vm';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

@Controller('users/friends')
export class FriendsController {
  constructor(
    private readonly findUseCase: FindFriendsUseCase,
    private readonly createRequestUseCase: CreateFriendRequestUseCase,
  ) {}

  @Get('')
  async getFriends(@Param(':id') id: string) {
    const friends = await this.findUseCase.execute(id);

    return friends.map((friend) => new FindFriendViewModel(friend));
  }

  @Post('/request')
  async createFriendRequest(@Body('id') id: string) {
    //TODO: change to user decorator
    const userId = 'b233ba54-50be-4dcc-9c84-a2ce366936a9';

    await this.createRequestUseCase.execute({
      primaryUserId: userId,
      targetUserId: id,
    });

    return true;
  }

  @Delete('')
  deleteFriends(@Param(':id') id: string) {
    console.log(id);
    return true;
  }

  @Get('request')
  getFriendsRequest() {
    return [
      {
        id: 'randomUuid',
        profileImage: 'https://localhost:8080/resources/test.jpg',
        introduction: 'Hello world!',
      },
      {
        id: 'randomUuid2',
        profileImage: 'https://localhost:8080/resources/test.jpg',
        introduction: 'Bye world!',
      },
    ];
  }

  @Post('request')
  acceptFriendsRequest(@Body('id') friendId: string) {
    console.log(friendId);
    return true;
  }

  @Delete('request')
  rejectFriendsRequest(@Param(':friend-id') friendId: string) {
    console.log(friendId);
    return true;
  }
}
