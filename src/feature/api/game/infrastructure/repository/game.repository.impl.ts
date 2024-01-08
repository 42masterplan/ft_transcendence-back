import { Game } from '../../domain/game';
import { GameRepository } from '../../domain/interface/game.repository';
import { GameEntity } from '../game.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameRepositoryImpl implements GameRepository {
  constructor(
    @InjectRepository(GameEntity)
    private readonly repository: EntityRepository<GameEntity>,
  ) {}

  async createOne({ isLadder }: { isLadder: boolean }): Promise<Game> {
    const game = await this.repository.create({ isLadder });

    await this.repository.getEntityManager().flush();
    return this.toDomain(game);
  }

  async findOneById(id: number): Promise<Game> {
    const game = await this.repository.findOneOrFail({ id });

    return this.toDomain(game);
  }

  private toDomain(entity: GameEntity): Game {
    if (!entity) return;
    return new Game({
      id: entity.id,
      isLadder: entity.isLadder,
      createdAt: entity.createdAt,
    });
  }
}
