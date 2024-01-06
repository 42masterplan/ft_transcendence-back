import { AchievementStatus } from '../../domain/achievement-status';
import { AchievementStatusRepository } from '../../domain/achievement-status.repository';
import { AchievementStatusEntity } from '../achievement-status.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AchievementStatusRepositoryImpl
  implements AchievementStatusRepository
{
  constructor(
    @InjectRepository(AchievementStatusEntity)
    private readonly repository: EntityRepository<AchievementStatusEntity>,
  ) {}

  async findAllByUserId(userId: string): Promise<AchievementStatus[]> {
    const achievements = await this.repository.find(
      {
        userId: userId,
      },
      { orderBy: { isAchieved: 'DESC', achievementId: 'ASC' } },
    );
    return achievements.map((achievement) => this.toDomain(achievement));
  }

  async findOneByUserIdAndAchievementId(
    userId: string,
    achievementId: number,
  ): Promise<AchievementStatus> {
    const achievement = await this.repository.findOne({
      userId: userId,
      achievementId: achievementId,
    });
    return this.toDomain(achievement);
  }

  async saveOne(
    userId: string,
    achievementId: number,
  ): Promise<AchievementStatus> {
    let flag = false;
    let achievementStatus: AchievementStatusEntity;
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        achievementStatus = await entityManager.create(
          AchievementStatusEntity,
          {
            userId,
            achievementId,
          },
        );
        if (!achievementStatus) return;
        await entityManager.persist(achievementStatus);
        flag = true;
      });
    if (!flag) return;
    return this.toDomain(achievementStatus);
  }

  async updateOne(
    achievementStatus: AchievementStatus,
  ): Promise<AchievementStatus> {
    let flag = false;
    let newAchievementStatus: AchievementStatusEntity;
    await this.repository
      .getEntityManager()
      .transactional(async (entityManager) => {
        const entity = this.toEntity(achievementStatus);
        newAchievementStatus = await entityManager.upsert(
          AchievementStatusEntity,
          entity,
        );
        if (!newAchievementStatus) return;
        await entityManager.persist(newAchievementStatus);
        flag = true;
      });
    if (!flag) return;
    return this.toDomain(newAchievementStatus);
  }

  private toDomain(achievement: AchievementStatusEntity): AchievementStatus {
    if (!achievement) return null;
    return new AchievementStatus(achievement);
  }

  private toEntity(achievement: AchievementStatus): AchievementStatusEntity {
    const achievementEntity = new AchievementStatusEntity();
    achievementEntity.id = achievement.id;
    achievementEntity.userId = achievement.userId;
    achievementEntity.achievementId = achievement.achievementId;
    achievementEntity.count = achievement.count;
    achievementEntity.isAchieved = achievement.isAchieved;
    return achievementEntity;
  }
}
