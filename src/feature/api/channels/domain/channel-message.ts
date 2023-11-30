export class ChannelMessage {
	private readonly _id: string;
	private readonly _participantId: string;
	private readonly _channelId: string;
	private readonly _content: string;

  // TODO: implement validation
	constructor(props: {
		_id: string;
		_participantId: string;
		_channelId: string;
		_content: string;
	}) {
		this._id = props._id;
		this._participantId = props._participantId;
		this._channelId = props._channelId;
		this._content = props._content;
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