import {
  DateTimeType,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ChannelEntity } from './channel.entity';
import { v4 } from 'uuid';

@Entity({ tableName: 'channel_message' })
export class ChannelMessageEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ type: 'uuid' })
  participantId!: string;

  @Property({ type: 'uuid' })
  channelId!: string;

  @Property({ length: 512 })
  content: string;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => UserEntity)
  participant!: UserEntity;

  @ManyToOne(() => ChannelEntity)
  channel!: ChannelEntity;
}
