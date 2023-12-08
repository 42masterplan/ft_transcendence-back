import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ChannelParticipantEntity } from '../infrastructure/channel-participant.entity';
import { QueryOrder } from '@mikro-orm/core';

@Injectable()
export class ChannelParticipantRepository {
  constructor(private readonly em: EntityManager) {}
  
  async findOneByUserIdAndChannelId(userId, channelId): Promise<ChannelParticipantEntity> {
    console.log('repsitory findOneByUserIdAndChannelId');
    const channelEntity = await this.em.findOne(ChannelParticipantEntity, {participantId: userId, channelId: channelId});

    return channelEntity;
  }

  async findAllByUserId(userId: string): Promise<ChannelParticipantEntity[]> {
    console.log('repository: getMyChannels');
    const list = await this.em.find(
      ChannelParticipantEntity,
      { participantId: userId, isDeleted: false },
      { orderBy: { createdAt: QueryOrder.ASC } },
    );

    return list;
  }

  async findAllByChannelId(
    channelId: string,
  ): Promise<ChannelParticipantEntity[]> {
    console.log('repository: findAllByChannelId ', channelId);
    const list = await this.em.find(
      ChannelParticipantEntity,
      { channelId: channelId, isDeleted: false },
      { orderBy: { createdAt: QueryOrder.ASC } },
    );
    console.log(list);
    return list;
  }

  async saveOne(
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

  async countByChannelId(channelId: string): Promise<number> {
    console.log('repository: countUser');
    return await this.em.count(ChannelParticipantEntity, {
      channelId: channelId, isDeleted: false,
    });
  }

}
