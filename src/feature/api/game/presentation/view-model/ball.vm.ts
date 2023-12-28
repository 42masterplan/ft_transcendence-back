import { Ball } from '../type/ball';
import { VelocityViewModel } from './velocity.vm';

export class BallViewModel {
  private x: number;
  private y: number;
  private radius: number;
  private velocity: VelocityViewModel;
  private color: string;
  private lastCollision: number;
  private speed: number;

  constructor(param: Ball) {
    this.x = param.x;
    this.y = param.x;
    this.radius = param.radius;
    this.velocity = new VelocityViewModel(param.velocity);
    this.color = param.color;
    this.lastCollision = param.lastCollision;
    this.speed = param.speed;
  }
}
