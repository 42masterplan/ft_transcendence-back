import { DmEntity } from '../../infrastructure/dm.entity';
import { Dm } from '../dm';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DmRepository {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(DmEntity)
    private readonly repository: EntityRepository<DmEntity>,
  ) {}

  async saveOne({
    user1Id,
    user2Id,
  }: {
    user1Id: string;
    user2Id: string;
  }): Promise<Dm> {
    if (await this.repository.count({ user1Id, user2Id })) return;
    const newDm = this.repository.create({
      user1Id,
      user2Id,
    });
    await this.repository.getEntityManager().flush();
    return this.toDomain(newDm);
  }

  async findOneByUserIds({
    user1Id,
    user2Id,
  }: {
    user1Id: string;
    user2Id: string;
  }): Promise<Dm> {
    const dm = await this.repository.findOne({
      user1Id,
      user2Id,
    });
    if (!dm) return;
    return this.toDomain(dm);
  }

  async findOneById(id: string): Promise<Dm> {
    const dm = await this.repository.findOne({ id });
    if (!dm) return;
    return this.toDomain(dm);
  }

  toDomain(entity: DmEntity): Dm {
    if (entity === null) return null;
    return new Dm(entity);
  }

  toEntity(domain: Dm): DmEntity {
    if (domain === null) return null;
    const entity = new DmEntity();
    entity.user1Id = domain.user1Id;
    entity.user2Id = domain.user2Id;
    return entity;
  }
}
