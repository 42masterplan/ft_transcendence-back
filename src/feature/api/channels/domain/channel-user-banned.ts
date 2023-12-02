export class ChannelUserBanned {
	private readonly _userId: string;
	private readonly _channelId: string;

  // TODO: implement validation
	constructor(props: {
		userId: string;
		channelId: string;
	}) {
		this._userId = props.userId;
		this._channelId = props.channelId;
	}

	get userId(): string {
		return this._userId;
	}

	get channelId(): string {
		return this._channelId;
	}
}