export class Channel {
  private readonly _id: string;
  private readonly _name: string;
  private _status: string;
  private _password: string;
  private _isDeleted: boolean;

  // TODO: implement validation
  constructor(props: {
    id: string;
    name: string;
    status: string;
    password: string;
    isDeleted: boolean;
  }) {
    this._id = props.id;
    this._name = props.name;
    this._status = props.status;
    this._password = props.password;
    this._isDeleted = props.isDeleted;
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

  get isDeleted(): boolean {
    return this._isDeleted;
  }

  updatedIsDeleted(isDeleted: boolean) {
    this._isDeleted = isDeleted;
  }

  updatedStatus(status: string) {
    this._status = status;
  }

  updatedPassword(password: string) {
    this._password = password;
  }
}
