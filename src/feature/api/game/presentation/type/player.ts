import { PLAYER_A_COLOR, PLAYER_HEIGHT, PLAYER_WIDTH } from '../util';
import { Ball } from './ball';

export class Player {
  private readonly _id: string;
  private _socketId: string | null;
  private _x: number;
  private _y: number;
  private readonly _width: number;
  private readonly _height: number;
  private readonly _color: string;
  private _dx: number;

  constructor(props: { id: string; x: number; y: number; color: string }) {
    this._id = props.id;
    this._socketId = null;
    this._x = props.x;
    this._y = props.y;
    this._width = PLAYER_WIDTH;
    this._height = PLAYER_HEIGHT;
    this._color = props.color;
    this._dx = 0;
  }

  get id(): string {
    return this._id;
  }

  get socketId(): string | null {
    return this._socketId;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get color(): string {
    return this._color;
  }

  get dx(): number {
    return this._dx;
  }

  set socketId(socketId: string) {
    this._socketId = socketId;
  }

  set x(x: number) {
    this._x = x;
  }

  set y(y: number) {
    this._y = y;
  }

  set dx(dx: number) {
    this._dx = dx;
  }

  isCollided(ball: Ball) {
    const offsetX = ball.x - this._x + ball.radius;
    if (this._color === PLAYER_A_COLOR) {
      const offsetY = ball.y - this._y + ball.radius - this._height;
      return (
        offsetX < this._width + 4 &&
        offsetX > 0 &&
        offsetY <= 10 &&
        offsetY >= -10
      );
    } else {
      const offsetY = this._y - ball.y - ball.radius + this._height;
      return (
        offsetX < this._width + 4 &&
        offsetX > 0 &&
        offsetY >= -10 &&
        offsetY <= 10
      );
    }
  }

  handleCollision(ball: Ball, now: number) {
    ball.lastCollision = now;
    const reflectedAngle = -Math.atan2(ball.velocity.y, ball.velocity.x);
    ball.velocity.x = Math.cos(reflectedAngle) * ball.speed;
    ball.velocity.y = Math.sin(reflectedAngle) * ball.speed;
    this.applySpin(ball);
  }

  applySpin(ball: Ball) {
    const spinFactor = 0.4;
    ball.velocity.x += this._dx * spinFactor;
    let speed = Math.sqrt(
      ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y,
    );
    ball.velocity.x = ball.speed * (ball.velocity.x / speed);
    ball.velocity.y = ball.speed * (ball.velocity.y / speed);
    if (ball.velocity.x > 0.5) ball.velocity.x = 0.5;
    else if (ball.velocity.x < -0.5) ball.velocity.x = -0.5;
    speed = Math.sqrt(
      ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y,
    );
    ball.velocity.x = ball.speed * (ball.velocity.x / speed);
    ball.velocity.y = ball.speed * (ball.velocity.y / speed);
  }
}
