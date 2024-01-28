export class ChannelParticipant {
  private _role: string;
  private _chatableAt: Date;
  private readonly _participantId: string;
  private readonly _channelId: string;
  private _isDeleted: boolean;

  constructor(props: {
    role: string;
    chatableAt: Date;
    participantId: string;
    channelId: string;
    isDeleted: boolean;
  }) {
    this._role = props.role;
    this._chatableAt = props.chatableAt;
    this._participantId = props.participantId;
    this._channelId = props.channelId;
    this._isDeleted = props.isDeleted;
  }

  get role(): string {
    return this._role;
  }

  get chatableAt(): Date {
    return this._chatableAt;
  }

  get participantId(): string {
    return this._participantId;
  }

  get channelId(): string {
    return this._channelId;
  }

  get isDeleted(): boolean {
    return this._isDeleted;
  }

  updatedIsDeleted(isDeleted: boolean) {
    this._isDeleted = isDeleted;
  }

  updatedRole(role: string) {
    this._role = role;
  }

  updatedChatableAt(chatableAt: Date) {
    this._chatableAt = chatableAt;
  }
}
