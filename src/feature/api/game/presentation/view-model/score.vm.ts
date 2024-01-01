import { Score } from '../type/score';

export class ScoreViewModel {
  private playerA: number;
  private playerB: number;

  constructor(param: Score) {
    this.playerA = param.playerA;
    this.playerB = param.playerB;
  }
}
