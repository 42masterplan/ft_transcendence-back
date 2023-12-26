const SCREEN_WIDTH = 400;
const SCREEN_HEIGHT = 600; //screen ratio is 2:3
const PLAYER_WIDTH = 100;
const PLAYER_HEIGHT = 15;
const PLAYER_A_COLOR = 'rgba(217, 217, 217, 1)';
const PLAYER_B_COLOR = 'rgba(0, 133, 255, 1)';
const BALL_COLOR = 'white';
const BALL_SPEED = 5 / 3;
// ball velocity's speed is 5
const BALL_VELOCITY = { x: 1.1785, y: 1.1785 };
const PADDLE_OFFSET = SCREEN_WIDTH / 100;
const SCORE_LIMIT = 10;
const GAME_TIME_LIMIT = 180;
const DEBOUNCINGTIME = 500;
const RENDERING_RATE = 5;

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

  isCollided(ball) {
    const offsetX = ball.x - this.x + ball.radius;
    if (this.color === PLAYER_A_COLOR) {
      const offsetY = ball.y - this.y + ball.radius - this.height;
      return (
        offsetX < this.width + 4 &&
        offsetX > 0 &&
        offsetY <= 10 &&
        offsetY >= -10
      );
    } else {
      const offsetY = this.y - ball.y - ball.radius + this.height;
      return (
        offsetX < this.width + 4 &&
        offsetX > 0 &&
        offsetY >= -10 &&
        offsetY <= 10
      );
    }
  }
}
