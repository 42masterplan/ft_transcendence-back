export class User {
  private readonly _id: string;
  private readonly _intraId: string;
  private readonly _name: string | null;
  private readonly _profileImage: string;
  private readonly _is2faEnabled: boolean;
  private readonly _email: string | null;
  private readonly _currentStatus: string;
  private readonly _introduction: string;
  private readonly _isValidateEmail: boolean;
  private readonly _verificationCode: string | null;
  private readonly _isDeleted: boolean;
  private readonly _updatedAt: Date;

  // TODO: implement validation
  constructor(props: {
    id: string;
    intraId: string;
    name: string | null;
    profileImage: string;
    is2faEnabled: boolean;
    email: string | null;
    currentStatus: string;
    introduction: string;
    isValidateEmail: boolean;
    verificationCode: string | null;
    isDeleted: boolean;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._intraId = props.intraId;
    this._name = props.name;
    this._profileImage = props.profileImage;
    this._is2faEnabled = props.is2faEnabled;
    this._email = props.email;
    this._currentStatus = props.currentStatus;
    this._introduction = props.introduction;
    this._isValidateEmail = props.isValidateEmail;
    this._verificationCode = props.verificationCode;
    this._isDeleted = props.isDeleted;
    this._updatedAt = props.updatedAt;
  }

  get isDeleted(): boolean {
    return this._isDeleted;
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

  get isValidateEmail(): boolean {
    return this._isValidateEmail;
  }

  get verificationCode(): string {
    return this._verificationCode;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
