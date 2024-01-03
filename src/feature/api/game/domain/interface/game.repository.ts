import { Game } from '../game';

export interface GameRepository {
  createOne({ isLadder }: { isLadder: boolean }): Promise<Game>;
  findOneById(id: number): Promise<Game>;
}

export const GameRepository = Symbol('GAME_REPOSITORY');
