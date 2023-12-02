export class Friend {
  private readonly _id: number;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private readonly _myId: string;
  private readonly _friendId: string;
  private readonly _isDeleted: boolean;

  constructor(param: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    myId: string;
    friendId: string;
    isDeleted: boolean;
  }) {
    this._id = param.id;
    this._createdAt = param.createdAt;
    this._updatedAt = param.updatedAt;

    this._myId = param.myId;
    this._friendId = param.friendId;
    this._isDeleted = param.isDeleted;
  }

  get id(): number {
    return this._id;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  get myId(): string {
    return this._myId;
  }
  get friendId(): string {
    return this._friendId;
  }
  get isDeleted(): boolean {
    return this._isDeleted;
  }
}
