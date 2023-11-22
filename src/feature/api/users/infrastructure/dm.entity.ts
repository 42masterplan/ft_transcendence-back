import {
  Collection,
  DateTimeType,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { UserEntity } from './user.entity';
import { DmMessageEntity } from './dmMessage.entity';

@Entity({ tableName: 'dm' })
export class DmEntity {
  @ManyToOne(() => UserEntity, { primary: true })
  user1: UserEntity;

  @ManyToOne(() => UserEntity, { primary: true })
  user2: UserEntity;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // @OneToMany(() => DmMessageEntity, (message) => message.dm)
  // dmMessages = new Collection<DmMessageEntity>(this);
}
