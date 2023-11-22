import { QueryOrder } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ChannelEntity } from 'src/feature/api/channels/infrastructure/channel.entity';
import { ChannelMessageEntity } from 'src/feature/api/channels/infrastructure/channelMessage.entity';
import { ChannelParticipantEntity } from 'src/feature/api/channels/infrastructure/channelParticipant.entity';
import { CreateChannelDto } from '../presentation/gateway/dto/create-channel.dto';

@Injectable()
export class ChannelRepository {
  constructor(private readonly em: EntityManager) {}

  async findOneById(id: string): Promise<ChannelEntity> {
    return await this.em.findOne(ChannelEntity, { id: id });
  }

  async getAllByStatus(status: string): Promise<ChannelEntity[]> {
    const publicChannels = await this.em.find(ChannelEntity, {
      status: status,
    });
    return publicChannels;
  }

  async getMyChannels(userId): Promise<ChannelParticipantEntity[]> {
    const list = await this.em.find(
      ChannelParticipantEntity,
      {
        participant: userId,
      },
      { orderBy: { createdAt: QueryOrder.ASC } },
    );
    return list;
  }

  async getPublicChannels(userId): Promise<ChannelParticipantEntity[]> {
    console.log(`user: ${userId}`);
    const channels = await this.em
      .createQueryBuilder(ChannelParticipantEntity, 'participant')
      .select('*')
      .where('participant.participant_id != ?', [userId])
      .getResultList();

    // const channels = await this.em
    //   .createQueryBuilder(ChannelParticipantEntity, 'participant')
    //   .select('*')
    //   .leftJoin('participant.channel_id', 'channel')
    //   .where({ status: 'Public' })
    //   .getResultList();

    return channels;
  }

  async getChannelHistory(channelId): Promise<ChannelMessageEntity[]> {
    console.log(channelId);
    const channelHistory = await this.em.find(
      ChannelMessageEntity,
      {
        channel: channelId,
      },
      { orderBy: { createdAt: QueryOrder.ASC } },
    );
    console.log(`channelId : ${channelId}`);
    return channelHistory;
  }

  async countUser(channel: ChannelEntity): Promise<number> {
    return await this.em.count(ChannelEntity, channel);
  }

  async saveChannel(
    createChannelDto: CreateChannelDto,
  ): Promise<ChannelEntity> {
    const channel = await this.em.create(ChannelEntity, createChannelDto);
    await this.em.flush();
    console.log('save!');
    return channel;
  }

  async saveChannelParticipant(
    channelParticipant: ChannelParticipantEntity,
  ): Promise<ChannelParticipantEntity> {
    const savedChannelParticipant = await this.em.create(
      ChannelParticipantEntity,
      channelParticipant,
    );
    this.em.flush();
    return savedChannelParticipant;
  }
}
