import { GAME_STATUS } from '../../presentation/type/game-status.enum';
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
  findManyByUserId(userId): Promise<Array<PlayerScore>>;
  findManyByGameId(gameId: number): Promise<Array<PlayerScore>>;
}

export const PlayerScoreRepository = Symbol('PLAYER_SCORE_REPOSITORY');
