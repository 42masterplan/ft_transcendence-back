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

  async block({
    myId,
    targetId,
  }: {
    myId: string;
    targetId: string;
  }): Promise<BlockedUser> {
    const blockedUser = await this.repository.create({
      primaryUserId: myId,
      targetUserId: targetId,
    });
    await this.repository.getEntityManager().flush();
    return this.toDomain(blockedUser);
  }

  async isBlocked({
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
