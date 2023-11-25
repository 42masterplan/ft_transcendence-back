import {
  DateTimeType,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { bool } from 'joi';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'friend_request' })
export class FriendRequestEntity {
  @PrimaryKey()
  id: number;

  @Property({ type: 'uuid' })
  primaryUserId!: string;

  @Property({ type: 'uuid' })
  targetUserId!: string;

  @Property({ type: bool, default: false, nullable: true })
  isAccepted: boolean;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => UserEntity)
  primaryUser!: UserEntity;

  @ManyToOne(() => UserEntity)
  targetUser!: UserEntity;
}
