import { User } from '../../../domain/user';

export class FindUsersViewModel {
  readonly id: string;
  readonly profileImage: string;
  readonly name: string;
  readonly currentStatus: string;
  readonly introduction: string;

  constructor(param: User) {
    this.id = param.id;
    this.profileImage = param.profileImage;
    this.name = param.name;
    this.currentStatus = param.currentStatus;
    this.introduction = param.introduction;
  }
}
