import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/createChannel.dto';
import { ChannelEntity } from 'src/feature/api/channel/infrastructure/channel.entity';
import { Channel } from 'diagnostics_channel';
import { ChannelParticipantEntity } from 'src/feature/api/channel/infrastructure/channelParticipant.entity';

@Injectable()
export class ChannelRepository {
  constructor(private readonly em: EntityManager) {}

  async saveChannel(
    createChannelDto: CreateChannelDto,
  ): Promise<ChannelEntity> {
    const channel = await this.em.create(ChannelEntity, createChannelDto);
    this.em.flush();
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
