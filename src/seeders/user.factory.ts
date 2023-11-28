import { Factory, Faker } from "@mikro-orm/seeder";
import { UserEntity } from "../feature/api/users/infrastructure/user.entity";
import { EntityData } from "@mikro-orm/core";

export class UserFactory extends Factory<UserEntity> {
  model = UserEntity;

  protected definition(faker: Faker): EntityData<UserEntity> {
    return {
      name: faker.name.firstName(),
      intraId: faker.random.alphaNumeric(32),
      profileImage: faker.image.imageUrl(),
      is2faEnabled: faker.datatype.boolean(),
      email: faker.internet.email(),
      currentStatus: faker.lorem.words(3),
      introduction: faker.lorem.words(10),
    };
  }
}
