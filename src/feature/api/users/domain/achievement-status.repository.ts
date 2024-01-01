import { AchievementStatus } from "./achievement-status";


export interface AchievementStatusRepository {
  findAllByUserId(userId: string): Promise<AchievementStatus[]>;
  findOneByUserIdAndAchievementId(userId: string, achievementId: number): Promise<AchievementStatus>;
  saveOne(userId: string, achievementId: number): Promise<AchievementStatus>;
  updateOne(achievementStatus: AchievementStatus): Promise<AchievementStatus>;
}
export const AchievementStatusRepository = Symbol('ACHIEVEMENT_STATUS_REPOSITORY');
