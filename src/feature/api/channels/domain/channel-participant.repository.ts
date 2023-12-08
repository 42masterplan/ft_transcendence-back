import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ChannelParticipantEntity } from '../infrastructure/channel-participant.entity';
import { QueryOrder } from '@mikro-orm/core';
import { ChannelParticipant } from './channel-participant';

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

  async updateOne(userId: string, channelId: string): Promise<void> {
    console.log('repository: updateIsDeleted');
    await this.em.nativeUpdate(
      ChannelParticipantEntity,
      { participantId: userId, channelId: channelId },
      { isDeleted: false },
    );
  }

  private toDomain(channelParticipant: ChannelParticipantEntity): ChannelParticipant {
    return new ChannelParticipant({
      participantId: channelParticipant.participantId,
      channelId: channelParticipant.channelId,
      role: channelParticipant.role,
      chatableAt: channelParticipant.chatableAt,
      isDeleted: channelParticipant.isDeleted
    });
  }

  private toEntity(channelParticipant: ChannelParticipant): ChannelParticipantEntity {
    const channelParticipantEntity = new ChannelParticipantEntity();
    channelParticipantEntity.participantId = channelParticipant.participantId;
    channelParticipantEntity.channelId = channelParticipant.channelId;
    channelParticipantEntity.role = channelParticipant.role;
    channelParticipantEntity.chatableAt = channelParticipant.chatableAt;
    channelParticipantEntity.isDeleted = channelParticipant.isDeleted;

    return channelParticipantEntity;
  }s
}
