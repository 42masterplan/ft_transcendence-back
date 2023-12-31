import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { NotificationGateway } from '../../../notification/presentation/notification.gateway';
import { CreateFriendRequestUseCase } from '../../application/friends/create-friend-request.use-case';
import { FindAcceptableFriendRequestUseCase } from '../../application/friends/find-acceptable-friend-request.use-case';
import { FindFriendsUseCase } from '../../application/friends/find-friends.use-case';
import { FriendRequestUseCase } from '../../application/friends/friend-request.use-case';
import { FriendUseCase } from '../../application/friends/friend.use-case';
import { UsersUseCase } from '../../application/use-case/users.use-case';
import { FindFriendViewModel } from '../view-models/friends/find-friend.vm';
import { FindFriendsRequestToMeViewModel } from '../view-models/friends-request/find-friends-request-to-me.vm';

import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  Query,
  NotFoundException,
} from '@nestjs/common';

@Controller('users/friends')
export class FriendsController {
  private readonly logger = new Logger(FriendsController.name);

  constructor(
    private readonly findUseCase: FindFriendsUseCase,
    private readonly createRequestUseCase: CreateFriendRequestUseCase,
    private readonly friendRequestUseCase: FriendRequestUseCase,
    private readonly friendUseCase: FriendUseCase,
    private readonly findAcceptableFriendRequestUseCase: FindAcceptableFriendRequestUseCase,
    private readonly usersUseCase: UsersUseCase,
    private readonly notificationGateway: NotificationGateway,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get('')
  async getFriends(@Request() req) {
    this.logger.log('get friends');
    const intraId = req.user.sub;
    const user = await this.usersUseCase.findOneByIntraId(intraId);
    const friends = await this.findUseCase.execute(user.id);
    return friends.map((friend) => new FindFriendViewModel(friend));
  }

  @UseGuards(JwtAuthGuard)
  @Get('isFriend')
  async isFriend(@Request() req, @Query('name') friendName: string) {
    this.logger.log('is friend');
    const intraId = req.user.sub;
    const user = await this.usersUseCase.findOneByIntraId(intraId);
    const friend = await this.usersUseCase.findOneByName(friendName);
    if (!friend) throw new NotFoundException('There is no such user(friend).');
    const isFriend = await this.friendUseCase.isFriend({
      myId: user.id,
      friendId: friend.id,
    });
    return {
      isFriends: isFriend,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:friendId')
  async deleteFriends(
    @Request() req,
    @Param('friendId') friendId: string,
  ): Promise<boolean> {
    this.logger.log('delete friend');
    const intraId = req.user.sub;
    const user = await this.usersUseCase.findOneByIntraId(intraId);
    if (
      await this.friendUseCase.delete({
        myId: user.id,
        friendId,
      })
    ) {
      this.notificationGateway.handleSocialUpdate(user.id);
      this.notificationGateway.handleSocialUpdate(friendId);
      return true;
    }
    return false;
  }

  @UseGuards(JwtAuthGuard)
  @Get('request')
  async getFriendsRequest(
    @Request() req,
  ): Promise<FindFriendsRequestToMeViewModel[]> {
    this.logger.log('get my friend request');
    const intraId = req.user.sub;
    const user = await this.usersUseCase.findOneByIntraId(intraId);

    const friendsRequest =
      await this.findAcceptableFriendRequestUseCase.findFriendsRequestsToMe(
        user.id,
      );

    return friendsRequest.map(
      (friendRequest) => new FindFriendsRequestToMeViewModel(friendRequest),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('request')
  async createFriendRequest(
    @Request() req,
    @Body('friendId') friendId: string,
  ): Promise<boolean> {
    this.logger.log('send friend request');
    const intraId = req.user.sub;
    const user = await this.usersUseCase.findOneByIntraId(intraId);

    await this.createRequestUseCase.execute({
      primaryUserId: user.id,
      targetUserId: friendId,
    });
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Put('request')
  async acceptFriendRequest(@Body('requestId') requestId: number) {
    this.logger.log('accept friend request');
    await this.friendRequestUseCase.acceptFriendRequest({
      requestId: requestId,
    });

    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('request/:requestId')
  async rejectFriendRequest(@Param('requestId') requestId: number) {
    this.logger.log('reject friend request');
    await this.friendRequestUseCase.rejectFriendRequest({
      requestId: requestId,
    });

    return true;
  }
}
