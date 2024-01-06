import { FriendRequest } from '../../domain/friend/friend-request';
import { FriendRequestRepository } from '../../domain/friend/interface/friend-request.repository';
import { UsersUseCase } from '../use-case/users.use-case';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FindAcceptableFriendRequestUseCase {
  constructor(
    @Inject(FriendRequestRepository)
    private readonly repository: FriendRequestRepository,
    @Inject(UsersUseCase)
    private readonly usersUseCase: UsersUseCase,
  ) {}

  async findFriendsRequestsFromMe(myId: string): Promise<FriendRequest[]> {
    const myAcceptableFriendsRequest =
      await this.repository.findManyByPrimaryUserId(myId);

    await this.setTargetUser(myAcceptableFriendsRequest);
    return myAcceptableFriendsRequest;
  }

  async findFriendsRequestsToMe(myId: string): Promise<FriendRequest[]> {
    const myAcceptableFriendsRequest =
      await this.repository.findManyByTargetUserId(myId);

    await this.setPrimaryUser(myAcceptableFriendsRequest);
    return myAcceptableFriendsRequest;
  }

  private async setTargetUser(friendsRequest: FriendRequest[]) {
    await Promise.all(
      friendsRequest.map(async (friendRequest) => {
        const targetUser = await this.usersUseCase.findOne(
          friendRequest.targetUserId,
        );
        if (!targetUser) throw new NotFoundException('There is no such user.');
        friendRequest.connectTargetUser(targetUser);
      }),
    );
  }

  private async setPrimaryUser(friendsRequest: FriendRequest[]) {
    await Promise.all(
      friendsRequest.map(async (friendRequest) => {
        const primaryUser = await this.usersUseCase.findOne(
          friendRequest.primaryUserId,
        );
        if (!primaryUser) throw new NotFoundException('There is no such user.');
        friendRequest.connectPrimaryUser(primaryUser);
      }),
    );
  }
}
