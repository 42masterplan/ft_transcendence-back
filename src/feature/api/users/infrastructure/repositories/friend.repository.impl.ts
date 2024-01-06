import { Friend } from '../../domain/friend/friend';
import { FriendRepository } from '../../domain/friend/interface/friend.repository';
import { FriendEntity } from '../friend.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FriendRepositoryImpl implements FriendRepository {
  constructor(
    @InjectRepository(FriendEntity)
    private readonly repository: EntityRepository<FriendEntity>,
  ) {}

  async findManyByMyId(myId: string): Promise<Friend[]> {
    const friends = await this.repository.find({ myId, isDeleted: false });

    return friends.map((friend) => this.toDomain(friend));
  }

  async createFriend({
    myId,
    friendId,
  }: {
    myId: string;
    friendId: string;
  }): Promise<Friend> {
    let flag = false;
    let meAndFriend: FriendEntity;

    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        if (
          (await entityManager.count(FriendEntity, {
            myId,
            friendId,
            isDeleted: false,
          })) ||
          (await entityManager.count(FriendEntity, {
            myId: friendId,
            friendId: myId,
            isDeleted: false,
          }))
        )
          return;

        meAndFriend = await entityManager.create(FriendEntity, {
          myId,
          friendId,
        });
        const friendAndMe = await entityManager.create(FriendEntity, {
          myId: friendId,
          friendId: myId,
        });
        await entityManager.persist(meAndFriend);
        await entityManager.persist(friendAndMe);
        flag = true;
      });
    if (!flag) return;
    return this.toDomain(meAndFriend);
  }

  async deleteFriend({
    myId,
    friendId,
  }: {
    myId: string;
    friendId: string;
  }): Promise<Friend> {
    let flag = false;
    let meAndFriend: FriendEntity;

    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        meAndFriend = await entityManager.findOne(FriendEntity, {
          myId,
          friendId,
          isDeleted: false,
        });
        const friendAndMe = await entityManager.findOne(FriendEntity, {
          myId: friendId,
          friendId: myId,
          isDeleted: false,
        });
        if (!meAndFriend || !friendAndMe) return;

        meAndFriend.isDeleted = true;
        friendAndMe.isDeleted = true;

        await entityManager.persist(meAndFriend);
        await entityManager.persist(friendAndMe);
        flag = true;
      });
    if (!flag) return;
    return this.toDomain(meAndFriend);
  }

  private toDomain(entity: FriendEntity): Friend {
    return new Friend({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      myId: entity.myId,
      friendId: entity.friendId,
      isDeleted: entity.isDeleted,
    });
  }
}
