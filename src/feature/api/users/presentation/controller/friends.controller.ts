import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FindFriendsUseCase } from '../../application/friends/find-friends.use-case';

@Controller('users/friends')
export class FriendsController {
  constructor(private readonly findUseCase: FindFriendsUseCase) {}

  @Get('')
  getFriends(@Param(':id') id: string) {
    return this.findUseCase.execute(id);
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
  acceptFriendsRequest(@Param(':friend-id') friendId: string) {
    console.log(friendId);
    return true;
  }

  @Delete('request')
  rejectFriendsRequest(@Param(':friend-id') friendId: string) {
    console.log(friendId);
    return true;
  }
}
