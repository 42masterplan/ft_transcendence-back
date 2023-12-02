export class Dm {
	private readonly _user1Id: string;
	private readonly _user2Id: string;

  // TODO: implement validation
	constructor(props: {
		user1Id: string;
		user2Id: string;
	}){
		this._user1Id = props.user1Id;
		this._user2Id = props.user2Id;
	}

	get user1Id(): string {
		return this._user1Id;
	}

	get user2Id(): string {
		return this._user2Id;
	}
}