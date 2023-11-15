import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { bool } from 'joi';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'friend_request' })
export class FriendRequestEntity {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => UserEntity)
  primaryUser: number;

  @ManyToOne(() => UserEntity)
  targetUser: number;

  @Property({ type: bool, default: false })
  isAccepted: boolean;
}
