import { PlayerScoreRepository } from '../../domain/interface/player-score.repository';
import { PlayerScore } from '../../domain/player-score';
import { GAME_STATUS } from '../../presentation/type/game-status.enum';
import { PlayerScoreEntity } from '../player-score.entity';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
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
    let flag = false;
    let score: PlayerScoreEntity;
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        score = await entityManager.create(PlayerScoreEntity, {
          playerId,
          gameId,
          value,
          status,
        });
        if (!score) return;
        await entityManager.persist(score);
        flag = true;
      });
    if (!flag) return;
    return this.toDomain(score);
  }

  async findManyByUserId(userId: string): Promise<Array<PlayerScore>> {
    const scores = await this.repository.find(
      {
        playerId: userId,
      },
      { orderBy: { createdAt: QueryOrder.DESC } },
    );

    return scores.map((score) => this.toDomain(score));
  }

  async findManyByGameId(gameId: number): Promise<Array<PlayerScore>> {
    const scores = await this.repository.find(
      {
        gameId,
      },
      { orderBy: { createdAt: QueryOrder.ASC } },
    );

    return scores.map((score) => this.toDomain(score));
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
