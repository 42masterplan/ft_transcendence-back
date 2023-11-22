import { DateTimeType, Entity, ManyToOne, Property } from '@mikro-orm/core';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ChannelEntity } from './channel.entity';

@Entity({ tableName: 'channel_banned_user' })
export class ChannelBannedUserEntity {
  @ManyToOne(() => UserEntity, { primary: true })
  user: UserEntity;

  @ManyToOne(() => ChannelEntity, { primary: true })
  channel: ChannelEntity;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
