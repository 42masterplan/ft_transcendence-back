export class Score {
  private _playerA: number;
  private _playerB: number;

  constructor() {
    this._playerA = 0;
    this._playerB = 0;
  }

  get playerA(): number {
    return this._playerA;
  }

  get playerB(): number {
    return this._playerB;
  }

  set playerA(score: number) {
    this._playerA = score;
  }

  set playerB(score: number) {
    this._playerB = score;
  }
}
