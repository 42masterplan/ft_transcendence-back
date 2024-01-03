import { LadderMatch } from '../presentation/type/ladder-match';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LadderQueueService {
  insertQueue(ladderQueue: Array<LadderMatch>, newMatch: LadderMatch) {
    const newTier = newMatch.tier;
    const newExp = newMatch.exp;

    if (ladderQueue.length === 0) {
      ladderQueue.push(newMatch);
      return;
    }

    let low = 0;
    let high = ladderQueue.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);

      const currentTier = ladderQueue[mid].tier;
      const currentExp = ladderQueue[mid].exp;
      if (newTier < currentTier) {
        high = mid - 1;
      } else if (newTier > currentTier) {
        low = mid + 1;
      } else {
        if (newExp < currentExp) {
          high = mid - 1;
        } else if (newExp > currentExp) {
          low = mid + 1;
        } else {
          ladderQueue.splice(mid, 0, newMatch);
          return;
        }
      }
    }
    ladderQueue.splice(low, 0, newMatch);
  }

  sortQueueByTime(array: Readonly<Array<LadderMatch>>) {
    return [...array].sort((a, b) => (a.time > b.time ? -1 : 1));
  }
}
