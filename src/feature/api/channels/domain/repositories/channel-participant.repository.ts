import { ChannelParticipantEntity } from '../../infrastructure/channel-participant.entity';
import { ChannelParticipant } from '../channel-participant';
import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChannelParticipantRepository {
  constructor(
    @InjectRepository(ChannelParticipantEntity)
    private readonly repository: EntityRepository<ChannelParticipantEntity>,
  ) {}

  async findOneByUserIdAndChannelId(
    userId: string,
    channelId: string,
  ): Promise<ChannelParticipant> {
    console.log('repository findOneByUserIdAndChannelId');
    const channelEntity = await this.repository.findOne({
      participantId: userId,
      channelId: channelId,
    });

    if (!channelEntity) return;
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
    return list.map((channelParticipant) => this.toDomain(channelParticipant));
  }

  async findAllByChannelIdAndRole(
    channelId: string,
    role: string,
  ): Promise<ChannelParticipant[]> {
    console.log('repository: findAllByChannelIdAndRole ', channelId, role);
    const list = await this.repository.find(
      { channelId: channelId, role: role, isDeleted: false },
      { orderBy: { createdAt: QueryOrder.ASC } },
    );
    return list.map((channelParticipant) => this.toDomain(channelParticipant));
  }

  async saveOne({
    role,
    participantId,
    channelId,
  }): Promise<ChannelParticipant> {
    console.log('repository: saveChannelParticipant');
    let flag = false;
    let newChannelParticipant: ChannelParticipantEntity;
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        newChannelParticipant = await entityManager.create(
          ChannelParticipantEntity,
          {
            role,
            participantId,
            channelId,
          },
        );
        if (!newChannelParticipant) return;
        await entityManager.persist(newChannelParticipant);
        flag = true;
      });
    if (!flag) return;
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
    channelParticipant: ChannelParticipant,
  ): Promise<ChannelParticipant> {
    console.log('repository: updateIsDeleted');

    let flag = false;
    let newChannelParticipant: ChannelParticipantEntity;
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        const newEntity = this.toEntity(channelParticipant);
        newChannelParticipant = await entityManager.upsert(
          ChannelParticipantEntity,
          newEntity,
        );
        if (!newChannelParticipant) return;
        await entityManager.persist(newChannelParticipant);
        flag = true;
      });
    if (!flag) return;
    return this.toDomain(newChannelParticipant);
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
