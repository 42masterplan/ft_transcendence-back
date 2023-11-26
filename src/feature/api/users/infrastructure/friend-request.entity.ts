import {
  DateTimeType,
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { bool } from 'joi';

@Entity({ tableName: 'friend_request' })
export class FriendRequestEntity {
  @PrimaryKey()
  id: number;

  @Property()
  primaryUser_id: string;

  @Property()
  targetUser_id: string;

  @Property({ type: bool, default: false, nullable: true })
  isAccepted: boolean;

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' , onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
