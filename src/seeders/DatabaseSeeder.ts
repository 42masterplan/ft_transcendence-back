import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { UserEntity } from '../feature/api/users/infrastructure/user.entity';
import { UserFactory } from "./user.factory";
import { FriendEntity } from "../feature/api/users/infrastructure/friend.entity";
import { FriendFactory } from "./friend.factory";
import { FriendRequestFactory } from "./friend-request.factory";

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const user = await new UserFactory(em).make(6);
    const friend = await new FriendFactory(em).make(2);

    friend.forEach((el,i) => {
      el.myId = user[0].id;
      el.friendId = user[i + 1].id;
    })

    const friendRequest = await new FriendRequestFactory(em).make(2);

    friendRequest.forEach((el,i) => {
      el.primaryUserId = user[0].id;
      el.targetUserId = user[i + 2].id;
    })

    console.log(user);
  }
}
