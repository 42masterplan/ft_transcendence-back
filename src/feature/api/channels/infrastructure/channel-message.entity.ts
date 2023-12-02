import { DateTimeType, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({ tableName: 'channel_message' })
export class ChannelMessageEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = v4();

  @Property({ type: 'uuid' })
  participantId: string;

  @Property({ type: 'uuid' })
  channelId: string;

  @Property({ length: 512 })
  content: string;

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  createdAt: Date = new Date();

  @Property({
    type: DateTimeType,
    defaultRaw: 'current_timestamp',
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();
}
