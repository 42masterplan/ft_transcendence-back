import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ChannelEntity } from './channel.entity';

@Entity({ tableName: 'channel_message' })
export class ChannelMessageEntity {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => UserEntity)
  participant: string;

  @ManyToOne(() => ChannelEntity)
  channel: string;

  @Property({ length: 512 })
  content: string;
}
