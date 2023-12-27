import { User } from '../user';

export class FriendRequest {
  private readonly _id: number;
  private _isAccepted: boolean | null;
  private readonly _primaryUserId: string;
  private readonly _targetUserId: string;

  targetUser?: User | null;
  primaryUser?: User | null;

  // TODO: implement validation
  constructor(props: {
    id: number;
    isAccepted: boolean;
    primaryUserId: string;
    targetUserId: string;
  }) {
    this._id = props.id;
    this._isAccepted = props.isAccepted;
    this._primaryUserId = props.primaryUserId;
    this._targetUserId = props.targetUserId;
  }

  isAcceptedNull(): boolean {
    if ((this, this.isAccepted === null)) {
      return true;
    }

    return false;
  }

  updateIsAccepted(isAccepted: boolean): void {
    this._isAccepted = isAccepted;
  }

  connectTargetUser(user: User): void {
    this.targetUser = user;
  }

  connectPrimaryUser(user: User): void {
    this.primaryUser = user;
  }

  get id(): number {
    return this._id;
  }

  get isAccepted(): boolean | null {
    return this._isAccepted;
  }

  get primaryUserId(): string {
    return this._primaryUserId;
  }

  get targetUserId(): string {
    return this._targetUserId;
  }
}
