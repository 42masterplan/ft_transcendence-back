import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/createChannel.dto';
import { ChannelEntity } from 'src/feature/api/channel/infrastructure/channel.entity';
import { Channel } from 'diagnostics_channel';
import { ChannelParticipantEntity } from 'src/feature/api/channel/infrastructure/channelParticipant.entity';
import { User } from 'src/feature/api/users/domain/user';
import { ChannelMessageEntity } from 'src/feature/api/channel/infrastructure/channelMessage.entity';

@Injectable()
export class ChannelRepository {
  constructor(private readonly em: EntityManager) {}

  async findOne(id: string): Promise<ChannelEntity> {
    return await this.em.findOne(ChannelEntity, { id: id });
  }

  async getAllByStatus(status: string): Promise<ChannelEntity[]> {
    const publicChannels = await this.em.find(ChannelEntity, {
      status: status,
    });
    return publicChannels;
  }

  async getMyChannels(userId): Promise<ChannelParticipantEntity[]> {
    const myChannelList = await this.em
      .createQueryBuilder(ChannelParticipantEntity, 'channelParticipant')
      .leftJoinAndSelect('channelParticipant.participant', 'user')
      .where({ 'user.id': userId })
      .getResultList();
    return myChannelList;
  }

  async getChannelHistory(channelId): Promise<ChannelMessageEntity[]> {
    console.log(channelId);
    const channelHistory = await this.em.find(ChannelMessageEntity, {
      channel: channelId,
    });
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
    this.em.flush();
    return channel;
  }

  async saveMessage(
    message: ChannelMessageEntity,
  ): Promise<ChannelMessageEntity> {
    const newMessage = await this.em.create(ChannelMessageEntity, message);
    this.em.flush();

    return newMessage;
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
