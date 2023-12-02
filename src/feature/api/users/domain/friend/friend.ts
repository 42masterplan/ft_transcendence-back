export class Friend {
	private readonly _id: number;
	private readonly _isDeleted: boolean;
	private readonly _myId: string;
	private readonly _friendId: string;

  // TODO: implement validation
	constructor(props: {
		id: number;
		isDeleted: boolean;
		myId: string;
		friendId: string;
	}) {
		this._id = props.id;
		this._isDeleted = props.isDeleted;
		this._myId = props.myId;
		this._friendId = props.friendId;
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