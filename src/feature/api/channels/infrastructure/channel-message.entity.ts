import {
  DateTimeType,
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({ tableName: 'channel_message' })
export class ChannelMessageEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  participant_id: string;

  @Property()
  channel_id: string;

  @Property({ length: 512 })
  content: string;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
