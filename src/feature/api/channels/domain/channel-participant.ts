export class ChannelParticipant {
	private readonly _role: string;
	private readonly _chatableAt: string;
	private readonly _participantId: string;
	private readonly _channelId: string;

  // TODO: implement validation
	constructor(props: {
		_role: string;
		_chatableAt: string;
		_participantId: string;
		_channelId: string;
	}) {
		this._role = props._role;
		this._chatableAt = props._chatableAt;
		this._participantId = props._participantId;
		this._channelId = props._channelId;
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