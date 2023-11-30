import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { FriendRepository } from '../../domain/friend/interface/friend.repository';
import { FriendEntity } from '../friend.entity';

@Injectable()
export class FriendRepositoryImpl implements FriendRepository {
  constructor(
    @InjectRepository(FriendEntity)
    private readonly friendRepository: EntityRepository<FriendEntity>,
  ) {}

  findManyByMyId(myId: string): Promise<FriendEntity[]> {
    //TODO: return 타입 바꿔야함
    return this.friendRepository.find({ myId: myId });
  }
}
