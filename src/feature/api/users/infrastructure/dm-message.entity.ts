import {
  DateTimeType,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { DmEntity } from './dm.entity';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'dm_message' })
export class DmMessageEntity {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => UserEntity)
  participant: UserEntity;

  @ManyToOne(() => DmEntity)
  dm: string;

  @Property({ length: 512 })
  content: string;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
