import { DateTimeType, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { bool } from 'joi';

@Entity({ tableName: 'channel_participant' })
export class ChannelParticipantEntity {
  @PrimaryKey({ type: 'uuid' })
  participantId: string;

  @PrimaryKey({ type: 'uuid' })
  channelId: string;

  @Property({ length: 64 })
  role: string;

  @Property({ type: DateTimeType, defaultRaw: 'null' })
  chatableAt: Date = new Date(0);

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  createdAt: Date;

  @Property({
    type: DateTimeType,
    defaultRaw: 'current_timestamp',
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();

  @Property({ type: bool, default: false })
  isDeleted: boolean;
}
