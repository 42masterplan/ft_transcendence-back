import { FriendRequestEntity } from '../feature/api/users/infrastructure/friend-request.entity';
import { EntityData } from '@mikro-orm/core';
import { Factory, Faker } from '@mikro-orm/seeder';

export class FriendRequestFactory extends Factory<FriendRequestEntity> {
  model = FriendRequestEntity;

  protected definition(faker: Faker): EntityData<FriendRequestEntity> {
    return {
      primaryUserId: faker.random.alphaNumeric(32),
      targetUserId: faker.random.alphaNumeric(32),
      isAccepted: faker.datatype.boolean(),
    };
  }
}
