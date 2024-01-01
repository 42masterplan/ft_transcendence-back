import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";

@Entity({ tableName: 'achievement' })
export class AchievementEntity{
  @PrimaryKey()
  id: number;

  @Property({ length: 32 })
  @Unique()
  name: string;

  @Property()
  criterionNumber: number;
}