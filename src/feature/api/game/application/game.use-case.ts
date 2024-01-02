import { UsersUseCase } from '../../users/application/use-case/users.use-case';
import { Game } from '../domain/game';
import { GameRepository } from '../domain/interface/game.repository';
import { PlayerScoreRepository } from '../domain/interface/player-score.repository';
import { GAME_STATUS } from '../presentation/type/game-status.enum';
import { TIER } from '../presentation/type/tier.enum';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GameUseCase {
  constructor(
    @Inject(GameRepository)
    private readonly gameRepository: GameRepository,
    @Inject(PlayerScoreRepository)
    private readonly playerScoreRepository: PlayerScoreRepository,
    private readonly usersUseCase: UsersUseCase,
  ) {}

  async saveGame({
    playerAId,
    playerBId,
    playerAScore,
    playerBScore,
    isLadder,
  }): Promise<Game> {
    console.log('save game!!');
    const game = await this.gameRepository.createOne({ isLadder });
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

    if (isLadder) {
      const playerA = await this.usersUseCase.findOne(playerAId);
      const playerB = await this.usersUseCase.findOne(playerBId);
      const playerATierNum = this.getTierNum(playerA.tier);
      const playerBTierNum = this.getTierNum(playerB.tier);
      let playerAExpDifference, playerBExpDifference;
      const scoreDifference = Math.abs(playerAScore - playerBScore);
      const tierDifference = Math.abs(playerATierNum - playerBTierNum) + 1;

      if (playerATierNum < playerBTierNum) {
        if (playerAStatus === GAME_STATUS.win) {
          playerAExpDifference = (scoreDifference * tierDifference * 3) / 4;
          playerBExpDifference = playerAExpDifference * -1;
        } else {
          playerBExpDifference = scoreDifference / tierDifference;
          playerAExpDifference = playerBExpDifference * -1;
        }
      } else if (playerATierNum > playerBTierNum) {
        if (playerBStatus === GAME_STATUS.win) {
          playerBExpDifference = (scoreDifference * tierDifference * 3) / 4;
          playerAExpDifference = playerBExpDifference * -1;
        } else {
          playerAExpDifference = scoreDifference / tierDifference;
          playerBExpDifference = playerAExpDifference * -1;
        }
      } else {
        if (playerAStatus === GAME_STATUS.win) {
          playerAExpDifference = scoreDifference;
          playerBExpDifference = scoreDifference * -1;
        } else {
          playerBExpDifference = scoreDifference;
          playerAExpDifference = scoreDifference * -1;
        }
      }
      await this.usersUseCase.updateTierAndExp(playerAId, playerAExpDifference);
      await this.usersUseCase.updateTierAndExp(playerBId, playerBExpDifference);
    }
    return game;
  }

  private getTierNum(tier: TIER) {
    switch (tier) {
      case TIER.bronze:
        return 0;
      case TIER.silver:
        return 1;
      case TIER.gold:
        return 2;
      case TIER.platinum:
        return 3;
    }
  }
}
