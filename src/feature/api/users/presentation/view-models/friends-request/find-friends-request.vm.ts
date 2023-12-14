import { FriendRequest } from '../../../domain/friend/friend-request';

export class FindFriendsRequestViewModel {
  readonly id: number;
  readonly friend: {
    id: string;
    profileImage: string;
    name: string;
    introduction: string;
  };

  constructor(param: FriendRequest) {
    this.id = param.id;
    this.friend = {
      id: param.targetUser.id,
      profileImage: param.targetUser.profileImage,
      name: param.targetUser.name,
      introduction: param.targetUser.introduction,
    };
  }
}
