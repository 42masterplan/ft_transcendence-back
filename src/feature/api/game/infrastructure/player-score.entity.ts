import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'player_score' })
export class PlayerScoreEntity {
  @PrimaryKey({ type: 'uuid' })
  playerId: string;

  @PrimaryKey()
  gameId: number;

  @Property()
  value: number;

  @Property({ length: 32 })
  status: string;
}
