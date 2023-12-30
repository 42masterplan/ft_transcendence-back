import { ChannelMessage } from '../channel-message';
import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ChannelMessageEntity } from 'src/feature/api/channels/infrastructure/channel-message.entity';

@Injectable()
export class ChannelMessageRepository {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(ChannelMessageEntity)
    private readonly repository: EntityRepository<ChannelMessageEntity>,
  ) {}

  async saveOne({
    channelId,
    participantId,
    content,
  }): Promise<ChannelMessage> {
    const newMessage = this.repository.create({
      channelId: channelId,
      participantId: participantId,
      content: content,
    });
    await this.repository.getEntityManager().persistAndFlush(newMessage);

    return this.toDomain(newMessage);
  }

  async findAllByChannelId(channelId: string, blockedUsers): Promise<ChannelMessage[]> {
    const messages = await this.repository.find(
      {
        channelId: channelId,
        participantId: { $nin: blockedUsers }
      },
      { orderBy: { createdAt: QueryOrder.ASC } },
    );

    return messages.map((message) => this.toDomain(message));
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
