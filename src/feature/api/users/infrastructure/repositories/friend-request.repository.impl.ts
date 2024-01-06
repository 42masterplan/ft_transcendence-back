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
  }): Promise<FriendRequest> {
    let flag = false;
    let newFriendRequest: FriendRequestEntity;
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        const [friendRequest, count] = await entityManager.findAndCount(
          FriendRequestEntity,
          {
            primaryUserId,
            targetUserId,
            isAccepted: null,
          },
        );
        if (count) {
          newFriendRequest = friendRequest[0];
          flag = true;
          return;
        }
        newFriendRequest = await entityManager.create(FriendRequestEntity, {
          primaryUserId,
          targetUserId,
        });

        await entityManager.persist(newFriendRequest);
        flag = true;
      });
    if (!flag) return;
    return this.toDomain(newFriendRequest);
  }

  async findManyByPrimaryUserId(
    primaryUserId: string,
  ): Promise<FriendRequest[]> {
    const friendRequest = await this.repository.find({
      primaryUserId,
      isAccepted: null,
    });

    return friendRequest.map((friendRequest) => this.toDomain(friendRequest));
  }

  async findManyByTargetUserId(targetUserId: string): Promise<FriendRequest[]> {
    const friendRequest = await this.repository.find({
      targetUserId,
      isAccepted: null,
    });

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
    let flag = false;
    let entity: FriendRequestEntity;
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        entity = await entityManager.findOne(FriendRequestEntity, {
          id: friendRequest.id,
        });
        if (!entity) return;
        entity.isAccepted = friendRequest.isAccepted;
        await entityManager.persist(entity);
        flag = true;
      });
    if (!flag) return;
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
