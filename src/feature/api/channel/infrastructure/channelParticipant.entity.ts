import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ChannelEntity } from './channel.entity';
import { channel } from 'diagnostics_channel';

@Entity({ tableName: 'channel_participant' })
export class ChannelParticipantEntity {
  @ManyToOne(() => UserEntity, { primary: true })
  participant: UserEntity;

  @ManyToOne(() => ChannelEntity, { primary: true })
  channel: ChannelEntity;

  @Property({ length: 64 })
  role: string;

  @Property()
  chatableAt: string;

  static create(
    role: string,
    channel: ChannelEntity,
    user: UserEntity,
  ): ChannelParticipantEntity {
    const channelParticipant = new ChannelParticipantEntity();
    channelParticipant.role = role;
    channelParticipant.participant = user;
    channelParticipant.channel = channel;
    channelParticipant.chatableAt = '';
    return channelParticipant;
  }
}
