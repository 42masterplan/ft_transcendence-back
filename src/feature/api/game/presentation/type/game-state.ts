import { GAME_TIME_LIMIT } from '../util';
import { Ball } from './ball';
import { GAME_MODE } from './game-mode.type';
import { Player } from './player';
import { Score } from './score';

export class GameState {
  private readonly _matchId: string;
  private _playerA: Player | null;
  private _playerB: Player | null;
  private readonly _ball: Ball;
  private readonly _score: Score;
  private _time: number;
  private _isReady: boolean;
  private _isForfeit: boolean;
  private _isDeuce: boolean;
  private _gameMode: GAME_MODE;

  constructor(matchId: string, gameMode: string) {
    this._matchId = matchId;
    this._isReady = false;
    this._playerA = null;
    this._playerB = null;
    this._ball = new Ball();
    this._score = new Score();
    this._time = GAME_TIME_LIMIT;
    this._isForfeit = false;
    this._isDeuce = false;
    this._gameMode = GAME_MODE[gameMode];
  }

  get matchId(): string {
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

  get gameMode(): string {
    return this._gameMode;
  }

  set playerA(player: Player) {
    this._playerA = player;
  }

  set playerB(player: Player) {
    this._playerB = player;
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
