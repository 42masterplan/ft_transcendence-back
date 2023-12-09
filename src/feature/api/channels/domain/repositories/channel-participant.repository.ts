import { ChannelParticipantEntity } from '../../infrastructure/channel-participant.entity';
import { ChannelParticipant } from '../channel-participant';
import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChannelParticipantRepository {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(ChannelParticipantEntity)
    private readonly repository: EntityRepository<ChannelParticipantEntity>,
  ) {}

  async findOneByUserIdAndChannelId(
    userId,
    channelId,
  ): Promise<ChannelParticipant> {
    console.log('repository findOneByUserIdAndChannelId');
    const channelEntity = await this.repository.findOne({
      participantId: userId,
      channelId: channelId,
    });

    return this.toDomain(channelEntity);
  }

  async findAllByUserId(userId: string): Promise<ChannelParticipant[]> {
    console.log('repository: getMyChannels');
    const list = await this.repository.find(
      { participantId: userId, isDeleted: false },
      { orderBy: { updatedAt: QueryOrder.DESC } },
    );

    return list.map((channelParticipant) => this.toDomain(channelParticipant));
  }

  async findAllByChannelId(channelId: string): Promise<ChannelParticipant[]> {
    console.log('repository: findAllByChannelId ', channelId);
    const list = await this.repository.find(
      { channelId: channelId, isDeleted: false },
      { orderBy: { createdAt: QueryOrder.ASC } },
    );
    console.log(list);
    return list.map((channelParticipant) => this.toDomain(channelParticipant));
  }

  async saveOne({
    role,
    participantId,
    channelId,
  }): Promise<ChannelParticipant> {
    console.log('repository: saveChannelParticipant');
    const newChannelParticipant = this.repository.create({
      role: role,
      participantId: participantId,
      channelId: channelId,
    });
    await this.repository
      .getEntityManager()
      .persistAndFlush(newChannelParticipant);
    return this.toDomain(newChannelParticipant);
  }

  async countByChannelId(channelId: string): Promise<number> {
    console.log('repository: countUser');
    return await this.repository.count({
      channelId: channelId,
      isDeleted: false,
    });
  }

  async updateOne(
    userId: string,
    channelId: string,
    isDeleted: boolean,
  ): Promise<number> {
    console.log('repository: updateIsDeleted');
    return await this.repository.nativeUpdate(
      { participantId: userId, channelId: channelId },
      { isDeleted: isDeleted },
    );
  }

  private toDomain(
    channelParticipant: ChannelParticipantEntity,
  ): ChannelParticipant {
    return new ChannelParticipant({
      participantId: channelParticipant.participantId,
      channelId: channelParticipant.channelId,
      role: channelParticipant.role,
      chatableAt: channelParticipant.chatableAt,
      isDeleted: channelParticipant.isDeleted,
    });
  }

  private toEntity(
    channelParticipant: ChannelParticipant,
  ): ChannelParticipantEntity {
    const channelParticipantEntity = new ChannelParticipantEntity();
    channelParticipantEntity.participantId = channelParticipant.participantId;
    channelParticipantEntity.channelId = channelParticipant.channelId;
    channelParticipantEntity.role = channelParticipant.role;
    channelParticipantEntity.chatableAt = channelParticipant.chatableAt;
    channelParticipantEntity.isDeleted = channelParticipant.isDeleted;

    return channelParticipantEntity;
  }
}