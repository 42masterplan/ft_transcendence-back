import { DmMessageEntity } from '../../infrastructure/dm-message.entity';
import { DmMessage } from '../dm-message';
import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DmMessageRepository {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(DmMessageEntity)
    private readonly repository: EntityRepository<DmMessageEntity>,
  ) {}

  async findAllByDmId(dmId: string) {
    const messages = await this.repository.find(
      { dmId },
      { orderBy: { createdAt: QueryOrder.ASC } },
    );
    return messages?.map((message) => this.toDomain(message));
  }

  async saveOne({ dmId, content, participantId }): Promise<DmMessage> {
    const newMessage = this.repository.create({
      dmId,
      content,
      participantId,
    });
    await this.repository.getEntityManager().flush();
    return this.toDomain(newMessage);
  }

  toDomain(entity: DmMessageEntity): DmMessage {
    if (entity === null) return null;
    return new DmMessage({
      id: entity.id,
      participantId: entity.participantId,
      dmId: entity.dmId,
      content: entity.content,
    });
  }

  toEntity(domain: DmMessage): DmMessageEntity {
    if (domain === null) return null;
    const entity = new DmMessageEntity();
    entity.id = domain.id;
    entity.participantId = domain.participantId;
    entity.dmId = domain.dmId;
    entity.content = domain.content;
    return entity;
  }
}
