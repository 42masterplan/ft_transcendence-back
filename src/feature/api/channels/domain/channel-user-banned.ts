export class ChannelUserBanned {
	private readonly _userId: string;
	private readonly _channelId: string;

  // TODO: implement validation
	constructor(props: {
		_userId: string;
		_channelId: string;
	}) {
		this._userId = props._userId;
		this._channelId = props._channelId;
	}

	get userId(): string {
		return this._userId;
	}

	get channelId(): string {
		return this._channelId;
	}
}