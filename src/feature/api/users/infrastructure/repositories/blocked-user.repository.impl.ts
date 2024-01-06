import { BlockedUser } from '../../domain/blocked-user';
import { BlockedUserRepository } from '../../domain/friend/interface/blocked-user.repository';
import { BlockedUserEntity } from '../blocked-user.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlockedUserRepositoryImpl implements BlockedUserRepository {
  constructor(
    @InjectRepository(BlockedUserEntity)
    private readonly repository: EntityRepository<BlockedUserEntity>,
  ) {}

  async findManyByMyId(myId: string): Promise<BlockedUser[]> {
    const blocked = await this.repository.find({
      primaryUserId: myId,
      isDeleted: false,
    });
    return blocked.map((block) => this.toDomain(block));
  }

  async block({
    myId,
    targetId,
  }: {
    myId: string;
    targetId: string;
  }): Promise<BlockedUser> {
    let flag = false;
    let block: BlockedUserEntity;
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        block = await entityManager.create(BlockedUserEntity, {
          primaryUserId: myId,
          targetUserId: targetId,
        });
        if (!block) return;
        await entityManager.persist(block);
        flag = true;
      });
    if (!flag) return;
    return this.toDomain(block);
  }

  async unblock({
    myId,
    targetId,
  }: {
    myId: string;
    targetId: string;
  }): Promise<BlockedUser> {
    let flag = false;
    let block: BlockedUserEntity;
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        block = await entityManager.findOne(BlockedUserEntity, {
          primaryUserId: myId,
          targetUserId: targetId,
          isDeleted: false,
        });
        if (!block) return;
        block.isDeleted = true;

        await entityManager.persist(block);
        flag = true;
      });
    if (!flag) return;
    return this.toDomain(block);
  }

  async alreadyBlock({
    myId,
    targetId,
  }: {
    myId: string;
    targetId: string;
  }): Promise<boolean> {
    if (
      await this.repository.count({
        primaryUserId: myId,
        targetUserId: targetId,
        isDeleted: false,
      })
    )
      return true;
    return false;
  }

  private toDomain(entity: BlockedUserEntity): BlockedUser {
    return new BlockedUser({
      id: entity.id,
      primaryUserId: entity.primaryUserId,
      targetUserId: entity.targetUserId,
      isDeleted: entity.isDeleted,
    });
  }
}
