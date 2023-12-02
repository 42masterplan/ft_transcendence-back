export class ChannelMessage {
	private readonly _id: string;
	private readonly _participantId: string;
	private readonly _channelId: string;
	private readonly _content: string;

  // TODO: implement validation
	constructor(props: {
		id: string;
		participantId: string;
		channelId: string;
		content: string;
	}) {
		this._id = props.id;
		this._participantId = props.participantId;
		this._channelId = props.channelId;
		this._content = props.content;
	}

	get id(): string {
		return this._id;
	}

	get participantId(): string {
		return this._participantId;
	}

	get channelId(): string {
		return this._channelId;
	}

	get content(): string {
		return this._content;
	}
}