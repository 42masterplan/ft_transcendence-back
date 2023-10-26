import { Entity, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class UserEntity {
  @PrimaryKey()
  id: number;
}
