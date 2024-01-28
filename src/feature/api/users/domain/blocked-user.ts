export class BlockedUser {
  private readonly _id: number;
  private readonly _isDeleted: boolean;
  private readonly _primaryUserId: string;
  private readonly _targetUserId: string;

  constructor(props: {
    id: number;
    isDeleted: boolean;
    primaryUserId: string;
    targetUserId: string;
  }) {
    this._id = props.id;
    this._isDeleted = props.isDeleted;
    this._primaryUserId = props.primaryUserId;
    this._targetUserId = props.targetUserId;
  }

  get id(): number {
    return this._id;
  }

  get isDeleted(): boolean {
    return this._isDeleted;
  }

  get primaryUserId(): string {
    return this._primaryUserId;
  }

  get targetUserId(): string {
    return this._targetUserId;
  }
}
