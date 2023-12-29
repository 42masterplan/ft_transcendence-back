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

  private toDomain(entity: GameEntity): Game {
    return new Game({
      id: entity.id,
      theme: entity.theme,
      isLadder: entity.isLadder,
    });
  }
}
