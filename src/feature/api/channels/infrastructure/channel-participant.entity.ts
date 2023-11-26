import {
  DateTimeType,
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

@Entity({ tableName: 'channel_participant' })
export class ChannelParticipantEntity {
  @Property({ length: 64 })
  role: string;

  @Property()
  chatableAt: string;

  @PrimaryKey()
  participantId: string;

  @PrimaryKey()
  channelId: string;

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' , onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
