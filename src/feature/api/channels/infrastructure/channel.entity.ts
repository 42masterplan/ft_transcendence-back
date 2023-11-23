import {
  Collection,
  DateTimeType,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { ChannelMessageEntity } from './channelMessage.entity';
import { ChannelUserBannedEntity } from './channel-user-banned.entity';
import { ChannelParticipantEntity } from './channelParticipant.entity';

@Entity({ tableName: 'channel' })
export class ChannelEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ length: 64 })
  name: string;

  @Property({ length: 32 })
  status: string;

  @Property({ length: 32 })
  password: string;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => ChannelMessageEntity, (message) => message.channel)
  channelMessages = new Collection<ChannelMessageEntity>(this);

  @OneToMany(
    () => ChannelUserBannedEntity,
    (channelUserBanned) => channelUserBanned.channel,
  )
  channelUserBanneds = new Collection<ChannelUserBannedEntity>(this);

  @OneToMany(
    () => ChannelParticipantEntity,
    (channelParticipant) => channelParticipant.channel,
  )
  channelParticipants = new Collection<ChannelParticipantEntity>(this);
}
