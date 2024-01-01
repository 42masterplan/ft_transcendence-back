import { Game } from '../game';

export interface GameRepository {
  createOne({ isLadder }: { isLadder: boolean }): Promise<Game>;
}

export const GameRepository = Symbol('GAME_REPOSITORY');
