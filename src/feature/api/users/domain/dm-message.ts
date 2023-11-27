export class DmMessage {
	private readonly _id: number;
	private readonly _content: string;
	private readonly _participantId: string;
	private readonly _dmId: string;

  // TODO: implement validation
	constructor(props: {
		_id: number,
		_content: string,
		_participantId: string,
		_dmId: string,
	}) {
		this._id = props._id;
		this._content = props._content;
		this._participantId = props._participantId;
		this._dmId = props._dmId;
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