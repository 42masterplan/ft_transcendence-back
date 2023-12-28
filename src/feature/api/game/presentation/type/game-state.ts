import {
  GAME_TIME_LIMIT,
  PLAYER_A_COLOR,
  PLAYER_B_COLOR,
  PLAYER_WIDTH,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from '../util';
import { Ball } from './ball';
import { Player } from './player';
import { Score } from './score';

export class GameState {
  private readonly _matchId: number;
  private readonly _playerA: Player;
  private readonly _playerB: Player;
  private readonly _ball: Ball;
  private readonly _score: Score;
  private _time: number;
  private _isReady: boolean;
  private _isForfeit: boolean;
  private _isDeuce: boolean;

  constructor(matchId: number) {
    this._matchId = matchId;
    this._isReady = false;
    this._playerA = new Player({
      id: '',
      x: SCREEN_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: SCREEN_HEIGHT - 45,
      color: PLAYER_A_COLOR,
    });
    this._playerB = new Player({
      id: '',
      x: SCREEN_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: 30,
      color: PLAYER_B_COLOR,
    });
    this._ball = new Ball();
    this._score = new Score();
    this._time = GAME_TIME_LIMIT;
    this._isForfeit = false;
    this._isDeuce = false;
  }

  get matchId(): number {
    return this._matchId;
  }

  get playerA(): Player {
    return this._playerA;
  }

  get playerB(): Player {
    return this._playerB;
  }

  get ball(): Ball {
    return this._ball;
  }

  get score(): Score {
    return this._score;
  }

  get time(): number {
    return this._time;
  }

  get isReady(): boolean {
    return this._isReady;
  }

  get isForfeit(): boolean {
    return this._isForfeit;
  }

  get isDeuce(): boolean {
    return this._isDeuce;
  }

  set time(time: number) {
    this._time = time;
  }

  set isReady(isReady: boolean) {
    this._isReady = isReady;
  }

  set isForfeit(isForfeit: boolean) {
    this._isForfeit = isForfeit;
  }

  set isDeuce(isDeuce: boolean) {
    this._isDeuce = isDeuce;
  }
}
