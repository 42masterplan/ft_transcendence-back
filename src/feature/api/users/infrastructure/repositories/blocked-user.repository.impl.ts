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
    if (
      await this.repository.count({
        primaryUserId: myId,
        targetUserId: targetId,
        isDeleted: false,
      })
    )
      return;
    const block = await this.repository.create({
      primaryUserId: myId,
      targetUserId: targetId,
    });
    await this.repository.getEntityManager().flush();
    return this.toDomain(block);
  }

  async unblock({
    myId,
    targetId,
  }: {
    myId: string;
    targetId: string;
  }): Promise<BlockedUser> {
    const block = await this.repository.findOne({
      primaryUserId: myId,
      targetUserId: targetId,
      isDeleted: false,
    });
    if (!block) return;

    block.isDeleted = true;

    await this.repository.getEntityManager().flush();
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
    if (!entity) return;
    return new BlockedUser({
      id: entity.id,
      primaryUserId: entity.primaryUserId,
      targetUserId: entity.targetUserId,
      isDeleted: entity.isDeleted,
    });
  }
}
