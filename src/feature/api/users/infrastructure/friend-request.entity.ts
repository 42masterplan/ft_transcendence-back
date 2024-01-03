import {
  DateTimeType,
  Entity,
  Index,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { bool } from 'joi';

@Entity({ tableName: 'friend_request' })
@Index({ properties: ['primaryUserId', 'targetUserId'] })
export class FriendRequestEntity {
  @PrimaryKey()
  id: number;

  @Property({ type: 'uuid' })
  primaryUserId: string;

  @Property({ type: 'uuid' })
  targetUserId: string;

  @Property({ type: bool, default: null, nullable: true })
  isAccepted: boolean | null;

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  createdAt: Date;

  @Property({
    type: DateTimeType,
    defaultRaw: 'current_timestamp',
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();
}
