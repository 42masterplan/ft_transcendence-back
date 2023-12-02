export class ChannelParticipant {
  private readonly _role: string;
  private readonly _chatableAt: string;
  private readonly _participantId: string;
  private readonly _channelId: string;

  // TODO: implement validation
  constructor(props: {
    role: string;
    chatableAt: string;
    participantId: string;
    channelId: string;
  }) {
    this._role = props.role;
    this._chatableAt = props.chatableAt;
    this._participantId = props.participantId;
    this._channelId = props.channelId;
  }

  get role(): string {
    return this._role;
  }

  get chatableAt(): string {
    return this._chatableAt;
  }

  get participantId(): string {
    return this._participantId;
  }

  get channelId(): string {
    return this._channelId;
  }
}
