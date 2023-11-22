import {
  DateTimeType,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { bool } from 'joi';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'banned_user' })
export class BannedUserEntity {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => UserEntity)
  primaryUser: UserEntity;

  @ManyToOne(() => UserEntity)
  targetUser: UserEntity;

  @Property({ type: bool, default: false })
  isDeleted: boolean;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
