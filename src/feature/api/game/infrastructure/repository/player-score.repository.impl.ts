import { PlayerScoreRepository } from '../../domain/interface/player-score.repository';
import { PlayerScore } from '../../domain/player-score';
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

  private toDomain(entity: PlayerScoreEntity): PlayerScore {
    return new PlayerScore({
      playerId: entity.playerId,
      gameId: entity.gameId,
      value: entity.value,
      status: entity.status,
    });
  }
}
