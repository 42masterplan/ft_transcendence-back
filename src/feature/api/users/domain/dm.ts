export class Dm {
	private readonly _user1Id: string;
	private readonly _user2Id: string;

  // TODO: implement validation
	constructor(props: {
		_user1Id: string,
		_user2Id: string,
	}){
		this._user1Id = props._user1Id;
		this._user2Id = props._user2Id;
	}

	get user1Id(): string {
		return this._user1Id;
	}

	get user2Id(): string {
		return this._user2Id;
	}
}