import {
  DateTimeType,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ChannelEntity } from './channel.entity';

@Entity({ tableName: 'channel_participant' })
export class ChannelParticipantEntity {
  @Property({ length: 64 })
  role: string;

  @Property()
  chatableAt: string;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => UserEntity, { primary: true })
  participant!: string;

  @ManyToOne(() => ChannelEntity, { primary: true })
  channel!: string;
}
