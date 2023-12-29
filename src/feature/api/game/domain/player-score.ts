export class PlayerScore {
  private readonly _playerId: string;
  private readonly _gameId: number;
  private readonly _value: number;
  private readonly _status: GAME_STATUS;

  constructor(props: {
    playerId: string;
    gameId: number;
    value: number;
    status: string;
  }) {
    this._playerId = props.playerId;
    this._gameId = props.gameId;
    this._value = props.value;
    this._status = GAME_STATUS[props.status];
  }

  get playerId(): string {
    return this._playerId;
  }

  get gameId(): number {
    return this._gameId;
  }

  get value(): number {
    return this._value;
  }

  get status(): string {
    return this._status;
  }
}
