export class ChannelUserBanned {
  private readonly _userId: string;
  private readonly _channelId: string;
  private readonly _isDeleted: boolean;

  // TODO: implement validation
  constructor(props: { userId: string; channelId: string; isDeleted: boolean; }) {
    this._userId = props.userId;
    this._channelId = props.channelId;
    this._isDeleted = props.isDeleted;
  }

  get userId(): string {
    return this._userId;
  }

  get channelId(): string {
    return this._channelId;
  }

  get isDeleted(): boolean {
    return this._isDeleted;
  }
}
