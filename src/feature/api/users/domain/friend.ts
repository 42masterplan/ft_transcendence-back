export class Friend {
	private readonly _id: number;
	private readonly _isDeleted: boolean;
	private readonly _myId: string;
	private readonly _friendId: string;

  // TODO: implement validation
	constructor(props: {
		_id: number,
		_isDeleted: boolean,
		_myId: string,
		_friendId: string,
	}) {
		this._id = props._id;
		this._isDeleted = props._isDeleted;
		this._myId = props._myId;
		this._friendId = props._friendId;
	}

	get id(): number {
		return this._id;
	}

	get isDeleted(): boolean {
		return this._isDeleted;
	}
	get myId(): string {
		return this._myId;
	}
	get friendId(): string {
		return this._friendId;
	}
}