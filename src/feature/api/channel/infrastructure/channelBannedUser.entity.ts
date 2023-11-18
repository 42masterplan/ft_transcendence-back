import { Entity, ManyToOne } from '@mikro-orm/core';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ChannelEntity } from './channel.entity';

@Entity({ tableName: 'channel_banned_user' })
export class ChannelBannedUserEntity {
  @ManyToOne(() => UserEntity, { primary: true })
  user: UserEntity;

  @ManyToOne(() => ChannelEntity, { primary: true })
  channel: ChannelEntity;
}
