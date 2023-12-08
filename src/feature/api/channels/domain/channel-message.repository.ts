import { QueryOrder } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ChannelMessageEntity } from 'src/feature/api/channels/infrastructure/channel-message.entity';

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
}
