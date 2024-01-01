export class Game {
  private readonly _id: number;
  private readonly _isLadder: boolean;

  constructor(props: { id: number; isLadder: boolean }) {
    this._id = props.id;
    this._isLadder = props.isLadder;
  }

  get id(): number {
    return this._id;
  }

  get isLadder(): boolean {
    return this._isLadder;
  }
}
