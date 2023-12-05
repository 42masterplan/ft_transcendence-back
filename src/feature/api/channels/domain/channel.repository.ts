import { CreateChannelDto } from '../presentation/gateway/dto/create-channel.dto';
import { QueryOrder } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ChannelMessageEntity } from 'src/feature/api/channels/infrastructure/channel-message.entity';
import { ChannelParticipantEntity } from 'src/feature/api/channels/infrastructure/channel-participant.entity';
import { ChannelEntity } from 'src/feature/api/channels/infrastructure/channel.entity';

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

  async findAllByUserId(userId: string): Promise<ChannelParticipantEntity[]> {
    console.log('repository: getMyChannels');
    const list = await this.em.find(
      ChannelParticipantEntity,
      { participantId: userId },
      { orderBy: { createdAt: QueryOrder.ASC } },
    );

    return list;
  }

  async findPublicChannels(userId: string): Promise<ChannelEntity[]> {
    const myChannels = (await this.findAllByUserId(userId)).map(
      (channel) => channel.channelId,
    );
    const channels = await this.em.find(ChannelEntity, {
      id: { $nin: myChannels },
    });

    return channels;
  }

  async getChannelHistory(channelId: string): Promise<ChannelMessageEntity[]> {
    console.log('repository: getChannelHistory');
    const channelHistory = await this.em.find(
      ChannelMessageEntity,
      {
        channelId: channelId,
      },
      { orderBy: { createdAt: QueryOrder.ASC } },
    );
    return channelHistory;
  }

  async countUser(channelId: string): Promise<number> {
    console.log('repository: countUser');
    return await this.em.count(ChannelParticipantEntity, {
      channelId: channelId,
    });
  }

  async saveChannel(
    createChannelDto: CreateChannelDto,
  ): Promise<ChannelEntity> {
    console.log('repository: saveChannel');
    const channel = this.em.create(ChannelEntity, createChannelDto);
    await this.em.flush();
    return channel;
  }

  async saveChannelParticipant(
    channelParticipant: ChannelParticipantEntity,
  ): Promise<ChannelParticipantEntity> {
    console.log('repository: saveChannelParticipant');
    const savedChannelParticipant = this.em.create(
      ChannelParticipantEntity,
      channelParticipant,
    );
    await this.em.flush();
    return savedChannelParticipant;
  }
}
