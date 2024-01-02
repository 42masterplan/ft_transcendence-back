import { Player } from '../type/player';

export class PlayerViewModel {
  private id: string;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private color: string;
  private dx: number;

  constructor(param: Player) {
    this.id = param.socketId;
    this.x = param.x;
    this.y = param.y;
    this.width = param.width;
    this.height = param.height;
    this.color = param.color;
    this.dx = param.dx;
  }
}
