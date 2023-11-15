import {
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
  my: string;

  @ManyToOne(() => UserEntity)
  friend: string;

  @Property({ type: bool, default: false })
  isDeleted: boolean;
}
