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
  participant_id: string;

  @PrimaryKey()
  channel_id: string;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
