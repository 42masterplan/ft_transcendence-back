import { Velocity } from '../type/velocity';

export class VelocityViewModel {
  private x: number;
  private y: number;

  constructor(param: Velocity) {
    this.x = param.x;
    this.y = param.y;
  }
}
