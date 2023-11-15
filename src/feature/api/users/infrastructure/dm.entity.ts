import { Collection, Entity, ManyToOne, OneToMany } from '@mikro-orm/core';
import { UserEntity } from './user.entity';
import { DmMessageEntity } from './dmMessage.entity';

@Entity({ tableName: 'dm' })
export class DmEntity {
  @ManyToOne(() => UserEntity, { primary: true })
  user1: string;

  @ManyToOne(() => UserEntity, { primary: true })
  user2: string;

  // @OneToMany(() => DmMessageEntity, (message) => message.dm)
  // dmMessages = new Collection<DmMessageEntity>(this);
}
