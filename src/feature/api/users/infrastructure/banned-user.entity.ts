import {
  DateTimeType,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { UserEntity } from './user.entity';
import { bool } from 'joi';

@Entity({ tableName: 'banned_user' })
export class BannedUserEntity {
  @PrimaryKey()
  id: number;

  @Property({ type: 'uuid' })
  primaryUserId!: string;

  @Property({ type: 'uuid' })
  targetUserId!: string;

  @Property({ type: bool, default: false })
  isDeleted: boolean;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => UserEntity)
  primaryUser!: UserEntity;

  @ManyToOne(() => UserEntity)
  targetUser!: UserEntity;
}