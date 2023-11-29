import {
  DateTimeType,
  Entity,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../domain/user';

@Entity({ tableName: 'user' })
export class UserEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = v4();

  @Property({ length: 32 })
  @Unique()
  intraId: string;

  @Property({ length: 32, nullable: true })
  @Unique()
  name: string;

  @Property({ length: 128 })
  profileImage: string;

  @Property()
  is2faEnabled: boolean;

  @Property({ length: 128, nullable: true })
  email: string;

  @Property({ default: '', length: 32 })
  currentStatus: string;

  @Property({ length: 128 })
  introduction: string;

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  createdAt: Date = new Date();

  @Property({
    type: DateTimeType,
    defaultRaw: 'current_timestamp',
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();

  static from(user: User): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = user.id;
    userEntity.intraId = user.intraId;
    userEntity.name = user.name;
    userEntity.is2faEnabled = user.is2faEnabled;
    userEntity.email = user.email;

    return userEntity;
  }
}
