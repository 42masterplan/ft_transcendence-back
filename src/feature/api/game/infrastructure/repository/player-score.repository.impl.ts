import { PlayerScoreRepository } from '../../domain/interface/player-score.repository';
import { PlayerScore } from '../../domain/player-score';
import { GAME_STATUS } from '../../presentation/type/game-status.type';
import { PlayerScoreEntity } from '../player-score.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayerScoreRepositoryImpl implements PlayerScoreRepository {
  constructor(
    @InjectRepository(PlayerScoreEntity)
    private readonly repository: EntityRepository<PlayerScoreEntity>,
  ) {}

  async createOne({
    playerId,
    gameId,
    value,
    status,
  }: {
    playerId: string;
    gameId: number;
    value: number;
    status: GAME_STATUS;
  }): Promise<PlayerScore> {
    const score = await this.repository.create({
      playerId,
      gameId,
      value,
      status,
    });

    await this.repository.getEntityManager().flush();
    return this.toDomain(score);
  }

  private toDomain(entity: PlayerScoreEntity): PlayerScore {
    return new PlayerScore({
      playerId: entity.playerId,
      gameId: entity.gameId,
      value: entity.value,
      status: entity.status,
    });
  }
}
