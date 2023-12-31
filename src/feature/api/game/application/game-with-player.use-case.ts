import { UsersUseCase } from '../../users/application/use-case/users.use-case';
import { Game } from '../domain/game';
import { PlayerScoreRepository } from '../domain/interface/player-score.repository';
import { GAME_STATUS } from '../presentation/type/game-status.enum';
import { GameUseCase } from './game.use-case';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GameWithPlayerUseCase {
  constructor(
    @Inject(PlayerScoreRepository)
    private readonly playerScoreRepository: PlayerScoreRepository,
    private readonly usersUseCase: UsersUseCase,
    private readonly gameUseCase: GameUseCase,
  ) {}

  async findGamesWithPlayer(name: string): Promise<Array<Game>> {
    const result: Array<Game> = [];
    const games = await this.gameUseCase.findGamesByUserName(name);
    for await (const game of games) {
      const playerScores = await this.playerScoreRepository.findManyByGameId(
        game.id,
      );
      if (playerScores.length !== 2) continue;
      const playerAScore = playerScores.at(0);
      const playerBScore = playerScores.at(1);

      game.connectPlayerA(
        await this.usersUseCase.findOne(playerAScore.playerId),
        playerAScore.value,
      );
      game.connectPlayerB(
        await this.usersUseCase.findOne(playerBScore.playerId),
        playerBScore.value,
      );
      if (!game.playerA || !game.playerB) continue;
      result.push(game);
    }
    return result;
  }

  async getPlayerGameStat(
    name: string,
  ): Promise<{ win: number; lose: number }> {
    const user = await this.usersUseCase.findOneByName(name);
    const playerScores = await this.playerScoreRepository.findManyByUserId(
      user.id,
    );

    const winCount = playerScores.filter(
      (score) => score.status === GAME_STATUS.win,
    ).length;
    const loseCount = playerScores.filter(
      (score) => score.status === GAME_STATUS.lose,
    ).length;
    return { win: winCount, lose: loseCount };
  }
}
