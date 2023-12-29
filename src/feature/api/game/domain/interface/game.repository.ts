import { Game } from '../game';

export interface GameRepository {
  createOne({
    theme,
    isLadder,
  }: {
    theme: GAME_THEME;
    isLadder: boolean;
  }): Promise<Game>;
}

export const GameRepository = Symbol('GAME_REPOSITORY');
