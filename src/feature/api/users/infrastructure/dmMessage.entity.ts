import {
  DateTimeType,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { DmEntity } from './dm.entity';

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
