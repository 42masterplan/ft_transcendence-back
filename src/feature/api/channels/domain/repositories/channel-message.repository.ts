import { QueryOrder } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ChannelMessageEntity } from 'src/feature/api/channels/infrastructure/channel-message.entity';
import { ChannelMessage } from '../channel-message';

@Injectable()
export class ChannelMessageRepository {
  constructor(private readonly em: EntityManager) {}

  async saveOne(message: ChannelMessageEntity): Promise<ChannelMessageEntity> {
    const newMessage = this.em.create(ChannelMessageEntity, message);
    await this.em.flush();

    return newMessage;
  }

  async findAllByChannelId(channelId: string): Promise<ChannelMessageEntity[]> {
    const messages = await this.em.find(ChannelMessageEntity, {
      channelId: channelId,
    });

    return messages;
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

  private toDomain(entity: ChannelMessageEntity): ChannelMessage { 
    return new ChannelMessage({
      id: entity.id,
      participantId: entity.participantId,
      channelId: entity.channelId,
      content: entity.content,
    });
  }

  private toEntity(domain: ChannelMessage): ChannelMessageEntity {
    const entity = new ChannelMessageEntity();
    entity.id = domain.id;
    entity.participantId = domain.participantId;
    entity.channelId = domain.channelId;
    entity.content = domain.content;
    return entity;
  }
}
