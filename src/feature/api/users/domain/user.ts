export class User {
  private readonly _id: string;
  private readonly _intraId: string;
  private readonly _name: string;
  private readonly _profileImage: string;
  private readonly _is2faEnabled: boolean;
  private readonly _email: string;
  private readonly _currentStatus: string;
  private readonly _introduction: string;

  // TODO: implement validation
  constructor(props: {
    _id: string;
    _intraId: string;
    _name: string;
    _profileImage: string;
    _is2faEnabled: boolean;
    _email: string;
    _currentStatus: string;
    _introduction: string;
  }) {
    this._id = props._id;
    this._intraId = props._intraId;
    this._name = props._name;
    this._profileImage = props._profileImage;
    this._is2faEnabled = props._is2faEnabled;
    this._email = props._email;
    this._currentStatus = props._currentStatus;
    this._introduction = props._introduction;
  }

  get id(): string {
    return this._id;
  }

  get intraId(): string {
    return this._intraId;
  }

  get name(): string {
    return this._name;
  }

  get profileImage(): string {
    return this._profileImage;
  }

  get is2faEnabled(): boolean {
    return this._is2faEnabled;
  }

  get email(): string {
    return this._email;
  }
  
  get currentStatus(): string {
    return this._currentStatus;
  }

  get introduction(): string {
    return this._introduction;
  }
}
