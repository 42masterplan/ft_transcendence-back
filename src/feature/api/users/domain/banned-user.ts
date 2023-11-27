export class BannedUser {
	private readonly _id: number;
	private readonly _isDeleted: boolean;
	private readonly _primaryUserId: string;
	private readonly _targetUserId: string;

  // TODO: implement validation
	constructor(props: {
		_id: number,
		_isDeleted: boolean,
		_primaryUserId: string,
		_targetUserId: string,
	}) {
		this._id = props._id;
		this._isDeleted = props._isDeleted;
		this._primaryUserId = props._primaryUserId;
		this._targetUserId = props._targetUserId;
	}

	get id(): number {
		return this._id;
	}

	get isDeleted(): boolean {
		return this._isDeleted;
	}

	get primaryUserId(): string {
		return this._primaryUserId;
	}

	get targetUserId(): string {
		return this._targetUserId;
	}
}