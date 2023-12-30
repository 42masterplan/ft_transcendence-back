import { Game } from '../domain/game';
import { GameRepository } from '../domain/interface/game.repository';
import { PlayerScoreRepository } from '../domain/interface/player-score.repository';
import { GAME_STATUS } from '../presentation/type/game-status.type';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GameUseCase {
  constructor(
    @Inject(GameRepository)
    private readonly gameRepository: GameRepository,
    @Inject(PlayerScoreRepository)
    private readonly playerScoreRepository: PlayerScoreRepository,
  ) {}

  async saveGame({
    playerAId,
    playerBId,
    playerAScore,
    playerBScore,
    isLadder,
  }): Promise<Game> {
    console.log('save game!!');
    const game = await this.gameRepository.createOne(isLadder);
    const playerAStatus =
      playerAScore > playerBScore ? GAME_STATUS.win : GAME_STATUS.lose;
    const playerBStatus =
      playerBScore > playerAScore ? GAME_STATUS.win : GAME_STATUS.lose;

    await this.playerScoreRepository.createOne({
      playerId: playerAId,
      gameId: game.id,
      value: playerAScore,
      status: playerAStatus,
    });
    await this.playerScoreRepository.createOne({
      playerId: playerBId,
      gameId: game.id,
      value: playerBScore,
      status: playerBStatus,
    });
    return game;
  }
}
