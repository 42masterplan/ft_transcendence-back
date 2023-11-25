import {
  Collection,
  DateTimeType,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { UserEntity } from './user.entity';
import { DmMessageEntity } from './dm-message.entity';

@Entity({ tableName: 'dm' })
export class DmEntity {
  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: 'uuid' })
  user1Id!: string;

  @Property({ type: 'uuid' })
  user2Id!: string;

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => UserEntity, { primary: true })
  user1!: UserEntity;

  @ManyToOne(() => UserEntity, { primary: true })
  user2!: UserEntity;

  // @OneToMany(() => DmMessageEntity, (message) => message.dm)
  // dmMessages = new Collection<DmMessageEntity>(this);
}
