import {
  DateTimeType,
  Entity,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { bool } from 'joi';
import { v4 } from 'uuid';

@Entity({ tableName: 'channel' })
export class ChannelEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = v4();

  @Property({ length: 64 })
  name: string;

  @Property({ length: 32 })
  status: string;

  @Property({ length: 128, nullable: true })
  password: string;

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  createdAt: Date = new Date();

  @Property({
    type: DateTimeType,
    defaultRaw: 'current_timestamp',
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();

  @Property({ type: bool, default: false })
  isDeleted: boolean;
}
