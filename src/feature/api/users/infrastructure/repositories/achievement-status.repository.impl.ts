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
    if (await this.repository.count({ userId, achievementId })) return;
    const achievementStatus = this.repository.create({
      userId: userId,
      achievementId: achievementId,
    });
    await this.repository.getEntityManager().flush();
    return this.toDomain(achievementStatus);
  }

  async updateOne(
    achievementStatus: AchievementStatus,
  ): Promise<AchievementStatus> {
    const newAchievementStatus = await this.repository.upsert(
      this.toEntity(achievementStatus),
    );
    await this.repository.getEntityManager().flush();
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
