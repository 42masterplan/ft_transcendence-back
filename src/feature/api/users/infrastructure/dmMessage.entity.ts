import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { DmEntity } from './dm.entity';

@Entity({ tableName: 'message' })
export class DmMessageEntity {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => UserEntity)
  participant: string;

  @ManyToOne(() => DmEntity)
  dm: string;

  @Property({ length: 512 })
  content: string;
}
