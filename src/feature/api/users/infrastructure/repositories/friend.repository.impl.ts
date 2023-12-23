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
    const friends = await this.repository.find({ myId });

    return friends.map((friend) => this.toDomain(friend));
  }

  async deleteMyFriend({
    myId,
    friendId,
  }: {
    myId: string;
    friendId: string;
  }): Promise<Friend> {
    const friend = await this.repository.findOneOrFail({
      myId,
      friendId,
    });

    friend.isDeleted = true;

    this.repository.getEntityManager().flush();

    return this.toDomain(friend);
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
