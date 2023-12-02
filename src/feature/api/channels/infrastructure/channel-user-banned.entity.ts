import { DateTimeType, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'channel_user_banned' })
export class ChannelUserBannedEntity {
  @PrimaryKey({ type: 'uuid' })
  userId: string;

  @PrimaryKey({ type: 'uuid' })
  channelId: string;

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  createdAt: Date = new Date();

  @Property({
    type: DateTimeType,
    defaultRaw: 'current_timestamp',
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();
}
