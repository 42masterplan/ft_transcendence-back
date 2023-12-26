import {
  BALL_SPEED,
  PLAYER_A_COLOR,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  ball,
} from './util';

export class Player {
  private _id: string;
  private _x: number;
  private _y: number;
  private _width: number;
  private _height: number;
  private _color: string;
  private _dx: number;

  constructor(props: { id: string; x: number; y: number; color: string }) {
    this._id = props.id;
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

  set dx(dx: number) {
    this._dx = dx;
  }

  isCollided(ball: ball) {
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

  handleCollision(ball: ball, now: number) {
    ball.lastCollision = now;
    const reflectedAngle = -Math.atan2(ball.velocity.y, ball.velocity.x);
    ball.velocity.x = Math.cos(reflectedAngle) * BALL_SPEED;
    ball.velocity.y = Math.sin(reflectedAngle) * BALL_SPEED;
    this.applySpin(ball);
  }

  applySpin(ball: ball) {
    const spinFactor = 0.4;
    ball.velocity.x += this._dx * spinFactor;
    let speed = Math.sqrt(
      ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y,
    );
    ball.velocity.x = BALL_SPEED * (ball.velocity.x / speed);
    ball.velocity.y = BALL_SPEED * (ball.velocity.y / speed);
    if (ball.velocity.x > 0.75) ball.velocity.x = 0.75;
    else if (ball.velocity.x < -0.75) ball.velocity.x = -0.75;
    speed = Math.sqrt(
      ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y,
    );
    ball.velocity.x = BALL_SPEED * (ball.velocity.x / speed);
    ball.velocity.y = BALL_SPEED * (ball.velocity.y / speed);
  }
}
