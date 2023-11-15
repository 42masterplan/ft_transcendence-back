import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ChannelEntity } from './channel.entity';

@Entity({ tableName: 'channel_participant' })
export class ChannelParticipantEntity {
  @ManyToOne(() => UserEntity, { primary: true })
  participant: string;

  @ManyToOne(() => ChannelEntity, { primary: true })
  channel: string;

  @Property({ length: 64 })
  role: string;

  @Property()
  chatableAt: string;
}
