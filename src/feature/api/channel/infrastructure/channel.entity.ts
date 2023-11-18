import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { ChannelMessageEntity } from './channelMessage.entity';
import { ChannelBannedUserEntity } from './channelBannedUser.entity';
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

  // @OneToMany(() => ChannelMessageEntity, (message) => message.channel)
  // channels = new Collection<ChannelMessageEntity>(this);

  // @OneToMany(
  //   () => ChannelBannedUserEntity,
  //   (channelBannedUser) => channelBannedUser.channel,
  // )
  // channelBannedUsers = new Collection<ChannelBannedUserEntity>(this);

  // @OneToMany(
  //   () => ChannelParticipantEntity,
  //   (channelParticipant) => channelParticipant.channel,
  // )
  // channelParticipants = new Collection<ChannelParticipantEntity>(this);
}
