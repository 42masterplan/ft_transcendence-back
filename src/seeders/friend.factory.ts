import { FriendEntity } from '../feature/api/users/infrastructure/friend.entity';
import { EntityData } from '@mikro-orm/core';
import { Factory, Faker } from '@mikro-orm/seeder';

export class FriendFactory extends Factory<FriendEntity> {
  model = FriendEntity;

  protected definition(faker: Faker): EntityData<FriendEntity> {
    return {
      myId: faker.random.alphaNumeric(32),
      friendId: faker.random.alphaNumeric(32),
      isDeleted: faker.datatype.boolean(),
    };
  }
}
