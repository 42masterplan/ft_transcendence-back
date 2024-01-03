import { Achievement } from './achievement';

export interface AchievementRepository {
  findAll(): Promise<Achievement[]>;
  findOneById(id: number): Promise<Achievement>;
}
export const AchievementRepository = Symbol('ACHIEVEMENT_REPOSITORY');
