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
    if (
      (await this.repository.count({
        myId,
        friendId,
        isDeleted: false,
      })) ||
      (await this.repository.count({
        myId: friendId,
        friendId: myId,
        isDeleted: false,
      }))
    )
      return;
    const meAndFriend = await this.repository.create({
      myId,
      friendId,
    });
    await this.repository.create({
      myId: friendId,
      friendId: myId,
    });

    await this.repository.getEntityManager().flush();

    return this.toDomain(meAndFriend);
  }

  async deleteFriend({
    myId,
    friendId,
  }: {
    myId: string;
    friendId: string;
  }): Promise<Friend> {
    const meAndFriend = await this.repository.findOne({
      myId,
      friendId,
      isDeleted: false,
    });
    const friendAndMe = await this.repository.findOne({
      myId: friendId,
      friendId: myId,
      isDeleted: false,
    });
    if (!meAndFriend || !friendAndMe) return;

    meAndFriend.isDeleted = true;
    friendAndMe.isDeleted = true;

    await this.repository.getEntityManager().flush();

    return this.toDomain(meAndFriend);
  }

  private toDomain(entity: FriendEntity): Friend {
    if (!entity) return null;
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
