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

  async findManyByPrimaryUserId(
    primaryUserId: string,
  ): Promise<FriendRequest[]> {
    const friendRequest = await this.repository.find({ primaryUserId });

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
    });

    return friendRequest.map((friendRequest) => this.toDomain(friendRequest));
  }

  async findOneByRequestId({ requestId }): Promise<FriendRequest> {
    const friendRequest = await this.repository.findOne({
      id: requestId,
    });
    return this.toDomain(friendRequest);
  }

  async update(friendRequest: FriendRequest): Promise<FriendRequest> {
    const entity = await this.repository.findOneOrFail(friendRequest.id);

    entity.isAccepted = friendRequest.isAccepted;
    //TODO: 동작하는지 확인 필요
    this.repository.getEntityManager().flush();

    return this.toDomain(entity);
  }

  private toDomain(entity: FriendRequestEntity): FriendRequest {
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
