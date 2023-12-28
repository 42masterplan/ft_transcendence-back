export class Velocity {
  private _x: number;
  private _y: number;

  constructor(props: { x: number; y: number }) {
    this._x = props.x;
    this._y = props.y;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  set x(x: number) {
    this._x = x;
  }

  set y(y: number) {
    this._y = y;
  }
}
