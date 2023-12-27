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
    const meAndFriend = await this.repository.create({
      myId,
      friendId,
    });
    await this.repository.create({
      myId: friendId,
      friendId: myId,
    });

    this.repository.getEntityManager().flush();

    return this.toDomain(meAndFriend);
  }

  async deleteFriend({
    myId,
    friendId,
  }: {
    myId: string;
    friendId: string;
  }): Promise<Friend> {
    const meAndFriend = await this.repository.findOneOrFail({
      myId,
      friendId,
    });
    const friendAndMe = await this.repository.findOneOrFail({
      myId: friendId,
      friendId: myId,
    });

    meAndFriend.isDeleted = true;
    friendAndMe.isDeleted = true;

    this.repository.getEntityManager().flush();

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
