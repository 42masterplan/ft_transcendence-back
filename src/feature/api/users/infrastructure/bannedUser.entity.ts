import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { UserEntity } from './user.entity';
import { bool, boolean } from 'joi';

@Entity({ tableName: 'banned_user' })
export class BannedUserEntity {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => UserEntity)
  primaryUser: string;

  @ManyToOne(() => UserEntity)
  targetUser: string;

  @Property({ type: bool, default: false })
  isDeleted: boolean;
}
