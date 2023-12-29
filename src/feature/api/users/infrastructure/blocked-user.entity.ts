import { DateTimeType, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { bool } from 'joi';

@Entity({ tableName: 'blocked_user' })
export class BlockedUserEntity {
  @PrimaryKey()
  id: number;

  @Property({ type: 'uuid' })
  primaryUserId: string;

  @Property({ type: 'uuid' })
  targetUserId: string;

  @Property({ type: bool, default: false })
  isDeleted: boolean;

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  createdAt: Date = new Date();

  @Property({
    type: DateTimeType,
    defaultRaw: 'current_timestamp',
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();
}
