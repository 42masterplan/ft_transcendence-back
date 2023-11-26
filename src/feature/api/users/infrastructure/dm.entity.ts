import { DateTimeType, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'dm' })
export class DmEntity {
  @PrimaryKey()
  user1_id: string;

  @PrimaryKey()
  user2_id: string;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
