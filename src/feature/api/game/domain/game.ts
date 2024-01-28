import { User } from '../../users/domain/user';

export class Game {
  private readonly _id: number;
  private readonly _isLadder: boolean;
  private readonly _createdAt: Date;

  playerA?: { user: User; score: number } | null;
  playerB?: { user: User; score: number } | null;

  constructor(props: { id: number; isLadder: boolean; createdAt: Date }) {
    this._id = props.id;
    this._isLadder = props.isLadder;
    this._createdAt = props.createdAt;
  }

  connectPlayerA(user: User, score: number): void {
    this.playerA = { user, score };
  }

  connectPlayerB(user: User, score: number): void {
    this.playerB = { user, score };
  }

  get id(): number {
    return this._id;
  }

  get isLadder(): boolean {
    return this._isLadder;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
