export class Game {
  private readonly _id: number;
  private readonly _theme: string;
  private readonly _isLadder: boolean;

  constructor(props: { id: number; theme: string; isLadder: boolean }) {
    this._id = props.id;
    this._theme = props.theme;
    this._isLadder = props.isLadder;
  }

  get id(): number {
    return this._id;
  }

  get theme(): string {
    return this._theme;
  }

  get isLadder(): boolean {
    return this._isLadder;
  }
}
