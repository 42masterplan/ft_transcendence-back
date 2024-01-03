import { DateTimeType, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { bool } from 'joi';

@Entity({ tableName: 'friend' })
export class FriendEntity {
  @PrimaryKey()
  id: number;

  @Property({ type: 'uuid' })
  myId: string;

  @Property({ type: 'uuid' })
  friendId: string;

  @Property({ type: bool, default: false })
  isDeleted: boolean;

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  createdAt: Date;

  @Property({
    type: DateTimeType,
    defaultRaw: 'current_timestamp',
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();
}
