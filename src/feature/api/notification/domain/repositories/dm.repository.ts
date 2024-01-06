import { DmEntity } from '../../infrastructure/dm.entity';
import { Dm } from '../dm';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DmRepository {
  constructor(
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
    let flag = false;
    let newDm: DmEntity;
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        const [dm, count] = await entityManager.findAndCount(DmEntity, {
          user1Id,
          user2Id,
        });
        if (count) {
          newDm = dm[0];
          flag = true;
          return;
        }
        newDm = await entityManager.create(DmEntity, {
          user1Id,
          user2Id,
        });
        if (!newDm) return;
        await entityManager.persist(newDm);
        flag = true;
      });
    if (!flag) return;
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
