export class PlayerTier {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _exp: number;

  constructor(props: { id: string; name: string; exp: number }) {
    this._id = props.id;
    this._name = props.name;
    this._exp = props.exp;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get exp(): number {
    return this._exp;
  }
}
