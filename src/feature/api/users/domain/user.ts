export class User {
  private readonly _id: number;

  // TODO: implement validation
  constructor(props: { _id: number }) {
    this._id = props._id;
  }

  get id(): number {
    return this._id;
  }
}
