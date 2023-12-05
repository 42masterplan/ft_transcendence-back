import { FriendRequest } from '../../domain/friend/friend-request';
import { FriendRequestRepository } from '../../domain/friend/interface/friend-request.repository';
import { FriendRequestEntity } from '../friend-request.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FriendRequestRepositoryImpl implements FriendRequestRepository {
  private readonly logger = new Logger(FriendRequestRepositoryImpl.name);

  constructor(
    @InjectRepository(FriendRequestEntity)
    private readonly repository: EntityRepository<FriendRequestEntity>,
  ) {}

  save({
    primaryUserId,
    targetUserId,
  }: {
    primaryUserId: string;
    targetUserId: string;
  }): Promise<void> {
    const newFriendRequest = this.repository.create({
      primaryUserId,
      targetUserId,
    });

    this.logger.log(newFriendRequest);

    return this.repository.getEntityManager().persist(newFriendRequest).flush();
  }

  async findManyByPrimaryUserIdTargetUserId({
    primaryUserId,
    targetUserId,
  }: {
    primaryUserId: string;
    targetUserId: string;
  }): Promise<FriendRequest[]> {
    const friendRequest = await this.repository.find({
      primaryUserId,
      targetUserId,
    });

    return friendRequest.map((friendRequest) => this.toDomain(friendRequest));
  }

  private toDomain(entity: FriendRequestEntity): FriendRequest {
    return new FriendRequest({
      id: entity.id,
      primaryUserId: entity.primaryUserId,
      targetUserId: entity.targetUserId,
      isAccepted: entity.isAccepted,
    });
  }
}
