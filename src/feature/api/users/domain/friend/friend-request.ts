export class FriendRequest {
  private readonly _id: number;
  private _isAccepted: boolean;
  private readonly _primaryUserId: string;
  private readonly _targetUserId: string;

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

  get id(): number {
    return this._id;
  }

  get isAccepted(): boolean {
    return this._isAccepted;
  }

  get primaryUserId(): string {
    return this._primaryUserId;
  }

  get targetUserId(): string {
    return this._targetUserId;
  }
}
