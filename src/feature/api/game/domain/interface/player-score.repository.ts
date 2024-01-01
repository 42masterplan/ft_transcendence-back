import { GAME_STATUS } from '../../presentation/type/game-status.type';
import { PlayerScore } from '../player-score';

export interface PlayerScoreRepository {
  createOne({
    playerId,
    gameId,
    value,
    status,
  }: {
    playerId: string;
    gameId: number;
    value: number;
    status: GAME_STATUS;
  }): Promise<PlayerScore>;
}

export const PlayerScoreRepository = Symbol('PLAYER_SCORE_REPOSITORY');
