import {
  DateTimeType,
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { bool } from 'joi';

@Entity({ tableName: 'friend' })
export class FriendEntity {
  @PrimaryKey()
  id: number;

  @Property()
  my_id: string;

  @Property()
  friend_id: string;

  @Property({ type: bool, default: false })
  isDeleted: boolean;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
