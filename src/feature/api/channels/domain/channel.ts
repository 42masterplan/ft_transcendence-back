export class Channel {
	private readonly _id: string;
	private readonly _name: string;
	private readonly _status: string;
	private readonly _password: string;

  // TODO: implement validation
	constructor(props: {
		_id: string,
		_name: string,
		_status: string,
		_password: string,
	}) {
		this._id = props._id;
		this._name = props._name;
		this._status = props._status;
		this._password = props._password;
	}

	get id(): string {
		return this._id;
	}

	get name(): string {
		return this._name;
	}

	get status(): string {
		return this._status;
	}

	get password(): string {
		return this._password;
	}
}