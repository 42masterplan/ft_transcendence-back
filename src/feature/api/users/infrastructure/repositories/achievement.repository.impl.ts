import { Injectable } from "@nestjs/common";
import { AchievementRepository } from "../../domain/achievement.repository";
import { InjectRepository } from "@mikro-orm/nestjs";
import { AchievementEntity } from "../achievement.entity";
import { EntityRepository } from "@mikro-orm/postgresql";
import { Achievement } from "../../domain/achievement";

@Injectable()
export class AchievementRepositoryImpl implements AchievementRepository{
  constructor(
    @InjectRepository(AchievementEntity)
    private readonly achievementRepository: EntityRepository<AchievementEntity>,
    ) {}
  
    async findAll(): Promise<Achievement[]> {
      const achievements = await this.achievementRepository.findAll();
      return achievements.map((achievement) => this.toDomain(achievement));
    }

    async findOneById(id: number): Promise<Achievement> {
      const achievement = await this.achievementRepository.findOne({ id });
      
      return this.toDomain(achievement);
    }

    private toDomain(achievement: AchievementEntity): Achievement {
      if (!achievement) return null;
      return new Achievement(achievement);
    }

    private toEntity(achievement: Achievement): AchievementEntity {
      const achievementEntity = new AchievementEntity();
      achievementEntity.id = achievement.id;
      achievementEntity.name = achievement.name;
      achievementEntity.criterionNumber = achievement.criterionNumber;
      return achievementEntity;
    }
} 