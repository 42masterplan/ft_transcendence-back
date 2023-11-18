import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { UserEntity } from './user.entity';
import { bool } from 'joi';

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
}
