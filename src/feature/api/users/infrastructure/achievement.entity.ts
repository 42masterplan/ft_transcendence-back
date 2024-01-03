import { DateTimeType, Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";

@Entity({ tableName: 'achievement' })
export class AchievementEntity{
  @PrimaryKey()
  id: number;

  @Property({ length: 32 })
  @Unique()
  name: string;

  @Property()
  criterionNumber: number;

  @Property({ type: DateTimeType, defaultRaw: 'current_timestamp' })
  createdAt: Date;

  @Property({
    type: DateTimeType,
    defaultRaw: 'current_timestamp',
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();
}