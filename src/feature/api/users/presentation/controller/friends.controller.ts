import { Controller, Delete, Get, Param, Post } from '@nestjs/common';

@Controller('users/friends')
export class FriendsController {
  @Get('')
  getFriends(@Param(':id') id: string) {
    console.log(id);
    return [
      {
        id: 'randomUuid',
        name: 'test1',
        profileImage: 'https://localhost:8080/resources/test.jpg',
        currentState: 'on-line',
        introduction: 'Hello world!',
      },
      {
        id: 'randomUuid2',
        name: 'test2',
        profileImage: 'https://localhost:8080/resources/test.jpg',
        currentState: 'off-line',
        introduction: 'Bye world!',
      },
    ];
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
