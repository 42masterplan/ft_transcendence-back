export class User {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _intraId: string;
  private readonly _is2faEnabled: boolean;
  private readonly _email: string;

  // TODO: implement validation
  constructor(props: {
    _id: string;
    _intraId: string;
    _name: string;
    _is2faEnabled: boolean;
    _email: string;
  }) {
    this._id = props._id;
    this._name = props._name;
    this._intraId = props._intraId;
    this._is2faEnabled = props._is2faEnabled;
    this._email = props._email;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._email;
  }

  get intraId(): string {
    return this._intraId;
  }

  get is2faEnabled(): boolean {
    return this._is2faEnabled;
  }

  get email(): string {
    return this._email;
  }

  get profileImage(): string {
    return 'this._profileImage';
  }

  get currentStatus(): string {
    return 'this._currentStatus';
  }

  get introduction(): string {
    return 'this._introduction';
  }
}
