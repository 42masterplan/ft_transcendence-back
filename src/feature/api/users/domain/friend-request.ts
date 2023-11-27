export class FriendRequest {
	private readonly _id: number;
	private readonly _isAccepted: boolean;
	private readonly _primaryUserId: string;
	private readonly _targetUserId: string;

  // TODO: implement validation
	constructor(props: {
		_id: number,
		_isAccepted: boolean,
		_primaryUserId: string,
		_targetUserId: string,
	}) {
		this._id = props._id;
		this._isAccepted = props._isAccepted;
		this._primaryUserId = props._primaryUserId;
		this._targetUserId = props._targetUserId;
	}

	get id(): number {
		return this._id;
	}

	get isAccepted(): boolean {
		return this._isAccepted;
	}

	get primaryUserId(): string {
		return this._primaryUserId;
	}

	get targetUserId(): string {
		return this._targetUserId;
	}
}