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
    id: string;
    intraId: string;
    name: string;
    profileImage: string;
    is2faEnabled: boolean;
    email: string;
    currentStatus: string;
    introduction: string;
  }) {
    this._id = props.id;
    this._intraId = props.intraId;
    this._name = props.name;
    this._profileImage = props.profileImage;
    this._is2faEnabled = props.is2faEnabled;
    this._email = props.email;
    this._currentStatus = props.currentStatus;
    this._introduction = props.introduction;
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
