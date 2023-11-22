import { DateTimeType, Entity, ManyToOne, Property } from '@mikro-orm/core';
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

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
