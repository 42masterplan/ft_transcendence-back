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
      const playerATierNum = await this.getTierNumById(playerAId);
      const playerBTierNum = await this.getTierNumById(playerBId);
      const scoreDifference = Math.abs(playerAScore - playerBScore);
      const { playerAExpDifference, playerBExpDifference } =
        this.getExpDifference({
          scoreDifference,
          playerATierNum,
          playerBTierNum,
          playerAStatus,
          playerBStatus,
        });
      await this.usersUseCase.updateTierAndExp(playerAId, playerAExpDifference);
      await this.usersUseCase.updateTierAndExp(playerBId, playerBExpDifference);
    }
    return game;
  }

  async findGamesByUserName(name: string): Promise<Array<Game>> {
    const result: Array<Game> = [];

    const user = await this.usersUseCase.findOneByName(name);
    if (!user) return;

    const scores = await this.playerScoreRepository.findManyByUserId(user.id);
    for await (const score of scores) {
      result.push(await this.gameRepository.findOneById(score.gameId));
    }
    return result;
  }

  private async getTierNumById(playerId: string): Promise<number> {
    const player = await this.usersUseCase.findOne(playerId);
    if (!player) return;
    switch (player.tier) {
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

  private getExpDifference({
    scoreDifference,
    playerATierNum,
    playerBTierNum,
    playerAStatus,
    playerBStatus,
  }: {
    scoreDifference: number;
    playerATierNum: number;
    playerBTierNum: number;
    playerAStatus: GAME_STATUS;
    playerBStatus: GAME_STATUS;
  }): {
    playerAExpDifference: number;
    playerBExpDifference: number;
  } {
    let playerAExpDifference, playerBExpDifference;
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
    return { playerAExpDifference, playerBExpDifference };
  }
}
