export class DmMessage {
	private readonly _id: number;
	private readonly _content: string;
	private readonly _participantId: string;
	private readonly _dmId: string;

  // TODO: implement validation
	constructor(props: {
		id: number;
		content: string;
		participantId: string;
		dmId: string;
	}) {
		this._id = props.id;
		this._content = props.content;
		this._participantId = props.participantId;
		this._dmId = props.dmId;
	}

	get id(): number {
		return this._id;
	}

	get content(): string {
		return this._content;
	}

	get participantId(): string {
		return this._participantId;
	}

	get dmId(): string {
		return this._dmId;
	}
}