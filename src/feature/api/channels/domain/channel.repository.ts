import { CreateChannelDto } from '../presentation/gateway/dto/create-channel.dto';
import { QueryOrder } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ChannelEntity } from 'src/feature/api/channels/infrastructure/channel.entity';
import { ChannelUserBannedEntity } from '../infrastructure/channel-user-banned.entity';

@Injectable()
export class ChannelRepository {
  constructor(private readonly em: EntityManager) {}

  async findOneById(id: string): Promise<ChannelEntity> {
    console.log('repository: findOneById');
    return await this.em.findOne(ChannelEntity, { id: id });
  }

  async findAllByStatus(status: string): Promise<ChannelEntity[]> {
    console.log('repository: getAllByStatus');
    const Channels = await this.em.find(ChannelEntity, {
      status: status,
    });
    return Channels;
  }

  async saveChannel(
    createChannelDto: CreateChannelDto,
  ): Promise<ChannelEntity> {
    console.log('repository: saveChannel');
    const channel = this.em.create(ChannelEntity, createChannelDto);
    await this.em.flush();
    return channel;
  }

  async findBannedUserByChannelId(channelId: string): Promise<ChannelUserBannedEntity[]> {
    console.log('repository findBannedUserByChannelId');
    const list = await this.em.find(ChannelUserBannedEntity, {channelId: channelId}, {orderBy: {createdAt: QueryOrder.ASC}});

    return list;
  }

  async findPublicChannels(userId: string, myChannels: string[]): Promise<ChannelEntity[]> {
    const channels = await this.em.find(ChannelEntity, {
      id: { $nin: myChannels },
    });

    return channels;
  }
}
