import { DateTimeType, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'achievement_status' })
export class AchievementStatusEntity {
  @PrimaryKey()
  id: number;

  @Property({ type: 'uuid' })
  userId: string;

  @Property()
  achievementId: number;

  @Property({ default: 0 })
  count: number = 0;

  @Property({ default: false })
  isAchieved: boolean = false;

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  createdAt: Date;

  @Property({
    type: DateTimeType,
    defaultRaw: 'current_timestamp',
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();
}
