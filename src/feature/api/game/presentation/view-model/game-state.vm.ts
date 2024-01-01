import { GameState } from '../type/game-state';
import { BallViewModel } from './ball.vm';
import { PlayerViewModel } from './player.vm';
import { ScoreViewModel } from './score.vm';

export class GameStateViewModel {
  private matchId: string;
  private playerA: PlayerViewModel;
  private playerB: PlayerViewModel;
  private ball: BallViewModel;
  private score: ScoreViewModel;
  private time: number;
  private isReady: boolean;
  private isForfeit: boolean;
  private isDeuce: boolean;

  constructor(param: GameState) {
    this.matchId = param.matchId;
    this.playerA = new PlayerViewModel(param.playerA);
    this.playerB = new PlayerViewModel(param.playerB);
    this.ball = new BallViewModel(param.ball);
    this.score = new ScoreViewModel(param.score);
    this.time = param.time;
    this.isReady = param.isReady;
    this.isForfeit = param.isForfeit;
    this.isDeuce = param.isDeuce;
  }
}
