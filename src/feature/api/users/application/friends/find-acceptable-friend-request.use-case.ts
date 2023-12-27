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
    private readonly usersUsecase: UsersUseCase,
  ) {}

  async findMyFriendsRequests(myId: string): Promise<FriendRequest[]> {
    const myFriendsRequest =
      await this.repository.findManyByPrimaryUserId(myId);

    const myAcceptableFriendsRequest = myFriendsRequest.filter(
      (myFriendRequest) => myFriendRequest.isAccepted === null,
    );

    this.setTargetUser(myAcceptableFriendsRequest);

    return myAcceptableFriendsRequest;
  }

  private async setTargetUser(friendsRequest: FriendRequest[]) {
    friendsRequest.map(async (friendRequest) =>
      friendRequest.connectTargetUser(
        await this.usersUsecase.findOne(friendRequest.targetUserId),
      ),
    );
  }
}
