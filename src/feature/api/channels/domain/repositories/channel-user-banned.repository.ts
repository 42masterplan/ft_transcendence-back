import { ChannelUserBannedEntity } from '../../infrastructure/channel-user-banned.entity';
import { ChannelUserBanned } from '../channel-user-banned';
import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChannelUserBannedRepository {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(ChannelUserBannedEntity)
    private readonly repository: EntityRepository<ChannelUserBannedEntity>,
  ) {}

  async saveOne(userId: string, channelId: string): Promise<ChannelUserBanned> {
    console.log('repository saveBannedUser');
    const newChannelUserBanned = this.repository.create({
      userId: userId,
      channelId: channelId,
    });
    await this.repository
      .getEntityManager()
      .persistAndFlush(newChannelUserBanned);
    return this.toDomain(newChannelUserBanned);
  }

  async updateOne(channelUserBanned: ChannelUserBanned): Promise<ChannelUserBanned> {
    console.log('repository updateBannedUser');
    const entity = this.toEntity(channelUserBanned);
    const newChannelUserBanned = await this.repository.upsert(entity);
    await this.repository.getEntityManager().flush();
    return this.toDomain(newChannelUserBanned);
  }

  async findAllByChannelId(channelId: string): Promise<ChannelUserBanned[]> {
    console.log('repository findBannedUserByChannelId');
    const list = await this.repository.find(
      { channelId: channelId },
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

    if (bannedUser) return this.toDomain(bannedUser);
    return null;
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
