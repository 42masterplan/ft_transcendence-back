import {
  BALL_COLOR,
  BALL_RADIUS,
  BALL_VELOCITY_X,
  BALL_VELOCITY_Y,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from '../util';

export class Ball {
  private readonly _x: number;
  private readonly _y: number;
  private readonly _radius: number;
  private readonly _velocity: VelocityType;
  private readonly _color: string;
  private _lastCollision: number;

  constructor() {
    this._x = SCREEN_WIDTH / 2;
    this._y = SCREEN_HEIGHT / 2;
    this._velocity.x = BALL_VELOCITY_X;
    this._velocity.y = BALL_VELOCITY_Y;
    this._radius = BALL_RADIUS;
    this._color = BALL_COLOR;
    this._lastCollision = 0;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get radius(): number {
    return this._radius;
  }

  get velocity(): VelocityType {
    return this._velocity;
  }

  get color(): string {
    return this._color;
  }

  get lastCollision(): number {
    return this._lastCollision;
  }

  set lastCollision(lastCollision: number) {
    this._lastCollision = lastCollision;
  }
}

export type VelocityType = {
  x: number;
  y: number;
};
