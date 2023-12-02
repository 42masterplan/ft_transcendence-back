import {
  DateTimeType,
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

@Entity({ tableName: 'channel_participant' })
export class ChannelParticipantEntity {
  @PrimaryKey({ type: 'uuid' })
  participantId: string;

  @PrimaryKey({ type: 'uuid' })
  channelId: string;

  @Property({ length: 64 })
  role: string;

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  chatableAt: Date = new Date();

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' , onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
