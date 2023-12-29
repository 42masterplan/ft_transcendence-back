import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'player_tier' })
export class PlayerScoreEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string;

  @Property({ length: 32 })
  name: string;

  @Property()
  exp: number;
}
