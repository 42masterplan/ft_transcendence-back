import {
  DateTimeType,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ChannelEntity } from './channel.entity';

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

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
