export class User {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _email: string;

  // TODO: implement validation
  constructor(props: { _id: string; _name: string; _email: string }) {
    this._id = props._id;
    this._name = props._name;
    this._email = props._email;
  }

  get id(): string {
    return this._id;
  }
}
