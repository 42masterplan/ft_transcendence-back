export class Dm {
  private readonly _user1Id: string;
  private readonly _user2Id: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _id: string;

  constructor(props: {
    user1Id: string;
    user2Id: string;
    createdAt: Date;
    updatedAt: Date;
    id: string;
  }) {
    this._user1Id = props.user1Id;
    this._user2Id = props.user2Id;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._id = props.id;
  }

  get id(): string {
    return this._id;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get user1Id(): string {
    return this._user1Id;
  }

  get user2Id(): string {
    return this._user2Id;
  }
}
