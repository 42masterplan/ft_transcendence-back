import { FriendRequest } from '../../domain/friend/friend-request';
import { FriendRequestRepository } from '../../domain/friend/interface/friend-request.repository';
import { UsersUseCase } from '../use-case/users.use-case';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAcceptableFriendRequestUseCase {
  constructor(
    @Inject(FriendRequestRepository)
    private readonly repository: FriendRequestRepository,
    @Inject(UsersUseCase)
    private readonly usersUseCase: UsersUseCase,
  ) {}

  async findFriendsRequestsFromMe(myId: string): Promise<FriendRequest[]> {
    const myFriendsRequest =
      await this.repository.findManyByPrimaryUserId(myId);

    const myAcceptableFriendsRequest = myFriendsRequest.filter(
      (myFriendRequest) => myFriendRequest.isAccepted === null,
    );

    await this.setTargetUser(myAcceptableFriendsRequest);
    return myAcceptableFriendsRequest;
  }

  async findFriendsRequestsToMe(myId: string): Promise<FriendRequest[]> {
    const myFriendsRequest = await this.repository.findManyByTargetUserId(myId);

    const myAcceptableFriendsRequest = myFriendsRequest.filter(
      (myFriendRequest) => myFriendRequest.isAccepted === null,
    );

    await this.setPrimaryUser(myAcceptableFriendsRequest);
    return myAcceptableFriendsRequest;
  }

  private async setTargetUser(friendsRequest: FriendRequest[]) {
    await Promise.all(
      friendsRequest.map(async (friendRequest) => {
        friendRequest.connectTargetUser(
          await this.usersUseCase.findOne(friendRequest.targetUserId),
        );
      }),
    );
  }

  private async setPrimaryUser(friendsRequest: FriendRequest[]) {
    await Promise.all(
      friendsRequest.map(async (friendRequest) => {
        friendRequest.connectPrimaryUser(
          await this.usersUseCase.findOne(friendRequest.primaryUserId),
        );
      }),
    );
  }
}
