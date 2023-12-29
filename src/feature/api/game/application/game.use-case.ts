import { GameRepository } from '../domain/interface/game.repository';
import { PlayerScoreRepository } from '../domain/interface/player-score.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GameUseCase {
  constructor(
    @Inject(GameRepository)
    private readonly gameRepository: GameRepository,
    @Inject(PlayerScoreRepository)
    private readonly playerScoreRepository: PlayerScoreRepository,
  ) {}
}
