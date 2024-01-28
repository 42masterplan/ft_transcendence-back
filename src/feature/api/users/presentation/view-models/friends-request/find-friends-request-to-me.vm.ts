import { FriendRequest } from '../../../domain/friend/friend-request';

export class FindFriendsRequestToMeViewModel {
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
      id: param.primaryUser.id,
      profileImage: param.primaryUser.profileImage,
      name: param.primaryUser.name,
      introduction: param.primaryUser.introduction,
    };
  }
}
