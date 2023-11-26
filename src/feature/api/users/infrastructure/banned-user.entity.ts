import {
  DateTimeType,
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { bool } from 'joi';

@Entity({ tableName: 'banned_user' })
export class BannedUserEntity {
  @PrimaryKey()
  id: number;

  @Property()
  primaryUser_id: string;

  @Property()
  targetUser_id: string;

  @Property({ type: bool, default: false })
  isDeleted: boolean;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
