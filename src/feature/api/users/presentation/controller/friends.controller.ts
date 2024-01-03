import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { CreateFriendRequestUseCase } from '../../application/friends/create-friend-request.use-case';
import { FindAcceptableFriendRequestUseCase } from '../../application/friends/find-acceptable-friend-request.use-case';
import { FindFriendsUseCase } from '../../application/friends/find-friends.use-case';
import { FriendRequestUseCase } from '../../application/friends/friend-request.use-case';
import { FriendUseCase } from '../../application/friends/friend.use-case';
import { UsersUseCase } from '../../application/use-case/users.use-case';
import { UsersService } from '../../users.service';
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
    private readonly userService: UsersService,
    private readonly userUseCase: UsersUseCase,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get('')
  async getFriends(@Request() req) {
    this.logger.log('getFriends');
    const intraId = req.user.sub;
    const user = await this.userService.findOneByIntraId(intraId);
    const friends = await this.findUseCase.execute(user.id);
    return friends.map((friend) => new FindFriendViewModel(friend));
  }

  @UseGuards(JwtAuthGuard)
  @Get('isFriend')
  async isFriend(@Request() req, @Query('name') friendName: string) {
    const intraId = req.user.sub;
    const user = await this.userUseCase.findOneByIntraId(intraId);
    const friend = await this.userUseCase.findOneByName(friendName);
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
    const intraId = req.user.sub;
    const user = await this.userService.findOneByIntraId(intraId);
    await this.friendUseCase.delete({
      myId: user.id,
      friendId,
    });

    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Get('request')
  async getFriendsRequest(
    @Request() req,
  ): Promise<FindFriendsRequestToMeViewModel[]> {
    const intraId = req.user.sub;
    const user = await this.userService.findOneByIntraId(intraId);

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
    const intraId = req.user.sub;
    const user = await this.userService.findOneByIntraId(intraId);

    await this.createRequestUseCase.execute({
      primaryUserId: user.id,
      targetUserId: friendId,
    });
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Put('request')
  async acceptFriendRequest(@Body('requestId') requestId: number) {
    await this.friendRequestUseCase.acceptFriendRequest({
      requestId: requestId,
    });
    //TODO:  양쪽으로 해줘야하는지 재고해보기
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('request/:requestId')
  async rejectFriendRequest(@Param('requestId') requestId: number) {
    await this.friendRequestUseCase.rejectFriendRequest({
      requestId: requestId,
    });

    return true;
  }
}
