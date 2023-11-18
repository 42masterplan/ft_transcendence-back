import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ChannelEntity } from './channel.entity';
import { v4 } from 'uuid';

@Entity({ tableName: 'channel_message' })
export class ChannelMessageEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => UserEntity)
  participant: UserEntity;

  @ManyToOne(() => ChannelEntity)
  channel: ChannelEntity;

  @Property({ length: 512 })
  content: string;

  static create(
    user: UserEntity,
    channel: ChannelEntity,
    content: string,
  ): ChannelMessageEntity {
    const channelMessage = new ChannelMessageEntity();
    channelMessage.participant = user;
    channelMessage.channel = channel;
    channelMessage.content = content;
    return channelMessage;
  }
}
