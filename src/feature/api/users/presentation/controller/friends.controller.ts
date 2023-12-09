import { CreateFriendRequestUseCase } from '../../application/friends/create-friend-request.use-case';
import { DeleteFriendUseCase } from '../../application/friends/delete-friend.use-case';
import { FindAcceptableFriendRequestUseCase } from '../../application/friends/find-acceptable-friend-request.use-case';
import { FindFriendsUseCase } from '../../application/friends/find-friends.use-case';
import { FriendRequestUseCase } from '../../application/friends/friend-request.use-case';
import { FindFriendViewModel } from '../view-models/friends/find-friend.vm';
import { FindFriendsRequestViewModel } from '../view-models/friends-request/find-friends-request.vm';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
} from '@nestjs/common';

@Controller('users/friends')
export class FriendsController {
  private readonly logger = new Logger(FriendsController.name);

  constructor(
    private readonly findUseCase: FindFriendsUseCase,
    private readonly createRequestUseCase: CreateFriendRequestUseCase,
    private readonly friendRequestUseCase: FriendRequestUseCase,
    private readonly deleteUseCase: DeleteFriendUseCase,
    private readonly findAcceptableFriendRequestUseCase: FindAcceptableFriendRequestUseCase,
  ) {}

  @Get('')
  async getFriends() {
    //TODO: add user decorator
    this.logger.log('getFriends');
    const friends = await this.findUseCase.execute(
      'd8397903-7238-4feb-9d00-6f94a5483ee0',
    );

    return friends.map((friend) => new FindFriendViewModel(friend));
  }

  @Delete(':friendId')
  deleteFriends(@Param('friendId') friendId: string): boolean {
    //TODO: change to user decorator
    this.deleteUseCase.execute({
      myId: 'd8397903-7238-4feb-9d00-6f94a5483ee0',
      friendId,
    });

    return true;
  }

  @Get('request')
  async getFriendsRequest(): Promise<FindFriendsRequestViewModel[]> {
    //TODO change to user decorator
    const myId = 'b233ba54-50be-4dcc-9c84-a2ce366936a9';

    const friendsRequest =
      await this.findAcceptableFriendRequestUseCase.findMyFriendsRequests(myId);

    return friendsRequest.map(
      (friendRequest) => new FindFriendsRequestViewModel(friendRequest),
    );
  }

  @Post('request')
  async createFriendRequest(
    @Body('friend-id') friendId: string,
  ): Promise<boolean> {
    //TODO: change to user decorator
    const userId = 'b233ba54-50be-4dcc-9c84-a2ce366936a9';

    await this.createRequestUseCase.execute({
      primaryUserId: userId,
      targetUserId: friendId,
    });

    return true;
  }

  //TODO: change interface
  @Put('request')
  async acceptFriendRequest(@Body('friend-id') friendId: string) {
    //TODO: change to user decorator

    await this.friendRequestUseCase.acceptFriendRequest({
      primaryUserId: 'b233ba54-50be-4dcc-9c84-a2ce366936a9',
      targetUserId: friendId,
    });

    return true;
  }

  //TODO: change interface
  @Delete('request/:friendId')
  async rejectFriendRequest(@Param('friendId') friendId: string) {
    //TODO: change to user decorator
    await this.friendRequestUseCase.rejectFriendRequest({
      primaryUserId: 'b233ba54-50be-4dcc-9c84-a2ce366936a9',
      targetUserId: friendId,
    });

    return true;
  }
}
