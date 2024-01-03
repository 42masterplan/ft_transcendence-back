import { Achievement } from '../feature/api/users/domain/achievement';
import { AchievementEntity } from '../feature/api/users/infrastructure/achievement.entity';
import { FriendRequestFactory } from './friend-request.factory';
import { FriendFactory } from './friend.factory';
import { UserFactory } from './user.factory';
import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

export class DatabaseSeeder extends Seeder {
  private names: string[] = [
    "와우! 첫 승리!", 
    "이런! 첫 패배!", 
    "너진짜잘한다", 
    "너진짜못한다", 
    "힘의 차이가 느껴지십니까?", 
    "여기여기 모여라", 
    "쉿! 조용히 해!", 
    "꼴보기 싫어", 
    "잠깐 나가줄래?",
  ];
  private criterionNumbers: number[] = [1, 1, 3, 3, 1, 1, 1, 1, 1];

  async run(em: EntityManager): Promise<void> {
    for (let i = 0; i < 9; i++)
    {
      const achievement = new AchievementEntity;
      achievement.id = i;
      achievement.name = this.names[i];
      achievement.criterionNumber = this.criterionNumbers[i];
      em.persistAndFlush(achievement);
    }
  }
}
