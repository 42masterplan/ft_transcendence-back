import { DateTimeType, Entity, ManyToOne, Property } from '@mikro-orm/core';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'dm' })
export class DmEntity {
  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => UserEntity, { primary: true })
  user1!: string;

  @ManyToOne(() => UserEntity, { primary: true })
  user2!: string;

  // @OneToMany(() => DmMessageEntity, (message) => message.dm)
  // dmMessages = new Collection<DmMessageEntity>(this);
}
