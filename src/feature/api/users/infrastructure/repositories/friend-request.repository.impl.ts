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

  async save({
    primaryUserId,
    targetUserId,
  }: {
    primaryUserId: string;
    targetUserId: string;
  }): Promise<void> {
    if (
      await this.repository.count({
        primaryUserId,
        targetUserId,
        isAccepted: null,
      })
    )
      return;
    const newFriendRequest = this.repository.create({
      primaryUserId,
      targetUserId,
    });

    this.logger.log(newFriendRequest);

    return await this.repository
      .getEntityManager()
      .persist(newFriendRequest)
      .flush();
  }

  async findManyByPrimaryUserId(
    primaryUserId: string,
  ): Promise<FriendRequest[]> {
    const friendRequest = await this.repository.find({ primaryUserId });

    return friendRequest.map((friendRequest) => this.toDomain(friendRequest));
  }

  async findManyByTargetUserId(targetUserId: string): Promise<FriendRequest[]> {
    const friendRequest = await this.repository.find({ targetUserId });

    return friendRequest.map((friendRequest) => this.toDomain(friendRequest));
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
      isAccepted: null,
    });

    return friendRequest.map((friendRequest) => this.toDomain(friendRequest));
  }

  async findOneByRequestId({ requestId }): Promise<FriendRequest> {
    const friendRequest = await this.repository.findOne({
      id: requestId,
    });
    if (!friendRequest) return;
    return this.toDomain(friendRequest);
  }

  async update(friendRequest: FriendRequest): Promise<FriendRequest> {
    const entity = await this.repository.findOne(friendRequest.id);
    if (!entity) return;

    entity.isAccepted = friendRequest.isAccepted;

    await this.repository.getEntityManager().flush();

    return this.toDomain(entity);
  }

  private toDomain(entity: FriendRequestEntity): FriendRequest {
    if (!entity) return null;
    return new FriendRequest({
      id: entity.id,
      primaryUserId: entity.primaryUserId,
      targetUserId: entity.targetUserId,
      isAccepted: entity.isAccepted,
    });
  }

  private toEntity(friendRequest: FriendRequest): FriendRequestEntity {
    const friendRequestEntity = new FriendRequestEntity();

    friendRequestEntity.id = friendRequest.id;
    friendRequestEntity.primaryUserId = friendRequest.primaryUserId;
    friendRequestEntity.targetUserId = friendRequest.targetUserId;
    friendRequestEntity.isAccepted = friendRequest.isAccepted;

    return friendRequestEntity;
  }
}
