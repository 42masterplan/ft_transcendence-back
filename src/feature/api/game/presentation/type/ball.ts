import {
  BALL_COLOR,
  BALL_RADIUS,
  BALL_SPEED,
  BALL_VELOCITY_X,
  BALL_VELOCITY_Y,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from '../util';
import { Velocity } from './velocity';

export class Ball {
  private _x: number;
  private _y: number;
  private readonly _radius: number;
  private _velocity: Velocity;
  private readonly _color: string;
  private _lastCollision: number;
  private _speed: number;

  constructor() {
    this._x = SCREEN_WIDTH / 2;
    this._y = SCREEN_HEIGHT / 2;
    this._velocity = new Velocity({ x: BALL_VELOCITY_X, y: BALL_VELOCITY_Y });
    this._radius = BALL_RADIUS;
    this._color = BALL_COLOR;
    this._lastCollision = 0;
    this._speed = BALL_SPEED;
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

  get velocity(): Velocity {
    return this._velocity;
  }

  get color(): string {
    return this._color;
  }

  get lastCollision(): number {
    return this._lastCollision;
  }

  get speed(): number {
    return this._speed;
  }

  set x(x: number) {
    this._x = x;
  }

  set y(y: number) {
    this._y = y;
  }

  set velocity(velocity: Velocity) {
    this._velocity = velocity;
  }

  set lastCollision(lastCollision: number) {
    this._lastCollision = lastCollision;
  }

  set speed(speed: number) {
    this._speed = speed;
  }
}
