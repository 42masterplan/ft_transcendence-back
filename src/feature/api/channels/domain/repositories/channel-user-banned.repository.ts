import { QueryOrder } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ChannelUserBannedEntity } from '../../infrastructure/channel-user-banned.entity';

@Injectable()
export class ChannelUserBannedRepository {
  constructor(private readonly em: EntityManager) {}
  async findAllByChannelId(channelId: string): Promise<ChannelUserBannedEntity[]> {
    console.log('repository findBannedUserByChannelId');
    const list = await this.em.find(ChannelUserBannedEntity, {channelId: channelId}, {orderBy: {updatedAt: QueryOrder.DESC}});

    return list;
  }

  async findOneByChannelIdAndUserId(channelId: string, userId: string): Promise<ChannelUserBannedEntity> {
    console.log('repository findBannedUserByChannelIdAndUserId');
    const bannedUser = await this.em.findOne(ChannelUserBannedEntity, {channelId: channelId, userId: userId});

    return bannedUser;
  }
}
