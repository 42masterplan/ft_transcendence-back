import { PlayerTierRepository } from '../../domain/interface/player-tier.repository';
import { PlayerTier } from '../../domain/player-tier';
import { PlayerTierEntity } from '../player-tier.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayerTierRepositoryImpl implements PlayerTierRepository {
  constructor(
    @InjectRepository(PlayerTierEntity)
    private readonly repository: EntityRepository<PlayerTierEntity>,
  ) {}

  private toDomain(entity: PlayerTierEntity): PlayerTier {
    return new PlayerTier({
      id: entity.id,
      name: entity.name,
      exp: entity.exp,
    });
  }
}
