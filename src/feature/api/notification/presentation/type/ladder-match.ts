import { TIER } from '../../../game/presentation/type/tier.enum';

export class LadderMatch {
  private readonly _id: string;
  private readonly _socketId: string;
  private readonly _tier: TIER;
  private readonly _tierNum: number;
  private readonly _exp: number;
  private _time: number;

  constructor(props: {
    id: string;
    socketId: string;
    tier: TIER;
    exp: number;
  }) {
    this._id = props.id;
    this._socketId = props.socketId;
    this._tier = props.tier;
    this._exp = props.exp;
    this._time = 0;
    switch (props.tier) {
      case TIER.bronze:
        this._tierNum = 0;
        break;
      case TIER.silver:
        this._tierNum = 1;
        break;
      case TIER.gold:
        this._tierNum = 2;
        break;
      case TIER.platinum:
        this._tierNum = 3;
        break;
    }
  }

  get id(): string {
    return this._id;
  }

  get socketId(): string {
    return this._socketId;
  }

  get tier(): TIER {
    return this._tier;
  }

  get tierNum(): number {
    return this._tierNum;
  }

  get exp(): number {
    return this._exp;
  }

  get time(): number {
    return this._time;
  }

  set time(time: number) {
    this._time = time;
  }
}
