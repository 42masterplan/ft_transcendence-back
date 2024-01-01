import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { bool } from 'joi';

@Entity({ tableName: 'game' })
export class GameEntity {
  @PrimaryKey()
  id: number;

  @Property({ type: bool, default: false })
  isLadder: boolean;
}
