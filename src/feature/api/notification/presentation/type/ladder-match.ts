import { TIER } from '../../../game/presentation/type/tier.enum';

export class LadderMatch {
  private readonly _id: string;
  private readonly _socketId: string;
  private readonly _tier: TIER;
  private readonly _tierNum: number;
  private readonly _exp: number;
  private _time: number;
  private _prev: LadderMatch | null;
  private _next: LadderMatch | null;
  private _removed: boolean;

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
      case TIER.Bronze:
        this._tierNum = 0;
        break;
      case TIER.Silver:
        this._tierNum = 1;
        break;
      case TIER.Gold:
        this._tierNum = 2;
        break;
      case TIER.Platinum:
        this._tierNum = 3;
        break;
    }
    this._prev = null;
    this._next = null;
    this._removed = false;
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

  get prev(): LadderMatch | null {
    return this._prev;
  }

  get next(): LadderMatch | null {
    return this._next;
  }

  get removed(): boolean {
    return this._removed;
  }

  set time(time: number) {
    this._time = time;
  }

  set prev(match: LadderMatch | null) {
    this._prev = match;
  }

  set next(match: LadderMatch | null) {
    this._next = match;
  }

  set removed(removed: boolean) {
    this._removed = removed;
  }
}
