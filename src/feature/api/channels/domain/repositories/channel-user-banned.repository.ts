import { ChannelUserBannedEntity } from '../../infrastructure/channel-user-banned.entity';
import { ChannelUserBanned } from '../channel-user-banned';
import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChannelUserBannedRepository {
  constructor(
    @InjectRepository(ChannelUserBannedEntity)
    private readonly repository: EntityRepository<ChannelUserBannedEntity>,
  ) {}

  async saveOne(userId: string, channelId: string): Promise<ChannelUserBanned> {
    console.log('repository saveBannedUser');
    let flag = false;
    let newChannelUserBanned: ChannelUserBannedEntity;
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        newChannelUserBanned = await entityManager.create(
          ChannelUserBannedEntity,
          {
            userId,
            channelId,
          },
        );
        if (!newChannelUserBanned) return;
        await entityManager.persist(newChannelUserBanned);
        flag = true;
      });
    if (!flag) return;
    return this.toDomain(newChannelUserBanned);
  }

  async updateOne(
    channelUserBanned: ChannelUserBanned,
  ): Promise<ChannelUserBanned> {
    console.log('repository updateBannedUser');
    let flag = false;
    let newChannelUserBanned: ChannelUserBannedEntity;
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        const entity = this.toEntity(channelUserBanned);

        newChannelUserBanned = await entityManager.upsert(
          ChannelUserBannedEntity,
          entity,
        );
        if (!newChannelUserBanned) return;
        await entityManager.persist(newChannelUserBanned);
        flag = true;
      });
    if (!flag) return;
    return this.toDomain(newChannelUserBanned);
  }

  async findAllByChannelId(channelId: string): Promise<ChannelUserBanned[]> {
    console.log('repository findBannedUserByChannelId');
    const list = await this.repository.find(
      { channelId: channelId, isDeleted: false },
      { orderBy: { updatedAt: QueryOrder.DESC } },
    );

    return list.map((channelUserBanned) => this.toDomain(channelUserBanned));
  }

  async findOneByChannelIdAndUserId(
    channelId: string,
    userId: string,
  ): Promise<ChannelUserBanned> {
    console.log('repository findBannedUserByChannelIdAndUserId');
    const bannedUser = await this.repository.findOne({
      channelId: channelId,
      userId: userId,
    });

    if (!bannedUser) return;
    return this.toDomain(bannedUser);
  }

  private toDomain(
    channelUserBanned: ChannelUserBannedEntity,
  ): ChannelUserBanned {
    return new ChannelUserBanned({
      userId: channelUserBanned.userId,
      channelId: channelUserBanned.channelId,
      isDeleted: channelUserBanned.isDeleted,
    });
  }

  private toEntity(
    channelUserBanned: ChannelUserBanned,
  ): ChannelUserBannedEntity {
    const entity = new ChannelUserBannedEntity();
    entity.userId = channelUserBanned.userId;
    entity.channelId = channelUserBanned.channelId;
    entity.isDeleted = channelUserBanned.isDeleted;
    return entity;
  }
}
