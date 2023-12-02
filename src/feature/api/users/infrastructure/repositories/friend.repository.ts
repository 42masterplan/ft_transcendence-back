import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Friend } from '../../domain/friend/friend';
import { FriendRepository } from '../../domain/friend/interface/friend.repository';
import { FriendEntity } from '../friend.entity';

@Injectable()
export class FriendRepositoryImpl implements FriendRepository {
  constructor(
    @InjectRepository(FriendEntity)
    private readonly friendRepository: EntityRepository<FriendEntity>,
  ) {}

  async findManyByMyId(myId: string): Promise<Friend[]> {
    const friends = await this.friendRepository.find({ myId: myId });

    return friends.map((friend) => this.toDomain(friend));
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
