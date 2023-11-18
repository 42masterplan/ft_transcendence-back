import {
  DateTimeType,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { UserEntity } from './user.entity';
import { bool } from 'joi';

@Entity({ tableName: 'friend' })
export class FriendEntity {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => UserEntity)
  my: UserEntity;

  @ManyToOne(() => UserEntity)
  friend: UserEntity;

  @Property({ type: bool, default: false })
  isDeleted: boolean;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
