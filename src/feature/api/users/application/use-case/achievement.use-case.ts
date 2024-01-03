import { Inject, Injectable } from "@nestjs/common";
import { AchievementRepository } from "../../domain/achievement.repository";
import { AchievementStatusRepository } from "../../domain/achievement-status.repository";

@Injectable()
export class AchievementUseCase {
  constructor(
    @Inject(AchievementRepository)
    private readonly achievementRepository: AchievementRepository,
    @Inject(AchievementStatusRepository)
    private readonly achievementStatusRepository: AchievementStatusRepository
  ) {}

  private names: string[] = ["너진짜잘한다", "너진짜못한다", "와우! 첫 승리!", "이런! 첫 패배!", "힘의 차이가 느껴지십니까?", "스토커", "여기여기 모여라", "쉿! 조용히 해!", "꼴보기 싫어", "잠깐 나가줄래?"];
  private descriptions: string[] = ["게임으로 3연승을 거두세요.", "게임으로 3연패를 당하세요.", "게임으로 첫 승리를 거두세요.", "게임으로 첫 패배를 당하세요.", "두배 점수차로 승리하세요", "연속으로 10개의 메세지를 보내세요", "채팅창을 만들어 보세요!", "참가자를 뮤트해 보세요", "참가자를 밴해 보세요", "참가자를 킥해 보세요"];

    async findAllByUserId(userId: string): Promise<any> {
      const achievementStatuses = await this.achievementStatusRepository.findAllByUserId(userId);
      return Promise.all(achievementStatuses.map(async (achievementStatus) => {
        const achievement = await this.achievementRepository.findOneById(achievementStatus.achievementId);
        return {
          name: this.names[achievement.id - 1],
          description: this.descriptions[achievement.id - 1],
          progressRate: achievementStatus.count / achievement.criterionNumber * 100,
        };
      }));
    }

    async initAchievementStatus(userId: string) {
      const achievements = await this.achievementRepository.findAll();
      for (const achievement of achievements) {
        await this.achievementStatusRepository.saveOne(userId, achievement.id);
      }
    }

    async handleGameAchievement(userId: string, isWin: boolean, myScore: number, opponentScore: number) {
      if (isWin)  {
        await this.handleFirstWin(userId);
        await this.handleThreeWins(userId);
        await this.resetThreeLoses(userId);
        if (myScore >= opponentScore * 2)
          await this.handleDoubleScoreWin(userId);
      }
      else {
        await this.handleFirstLose(userId);
        await this.handleThreeLoses(userId);
        await this.resetThreeWins(userId);
      }
    }

    async handleFirstWin(userId: string) {
      const achievementStatus = await this.achievementStatusRepository.findOneByUserIdAndAchievementId(userId, 3);
      if (achievementStatus.isAchieved) return;
      achievementStatus.updateCount(achievementStatus.count + 1);
      const achievement = await this.achievementRepository.findOneById(3);
      if (achievementStatus.count >= achievement.criterionNumber) {
        achievementStatus.updateIsAchieved(true);
      }
      await this.achievementStatusRepository.updateOne(achievementStatus);
    }

    async handleThreeWins(userId: string) {
      const achievementStatus = await this.achievementStatusRepository.findOneByUserIdAndAchievementId(userId, 1);
      if (achievementStatus.isAchieved) return;
      achievementStatus.updateCount(achievementStatus.count + 1);
      const achievement = await this.achievementRepository.findOneById(1);
      if (achievementStatus.count >= achievement.criterionNumber) {
        achievementStatus.updateIsAchieved(true);
      }
      await this.achievementStatusRepository.updateOne(achievementStatus);
    }

    async resetThreeWins(userId: string) {
      const achievementStatus = await this.achievementStatusRepository.findOneByUserIdAndAchievementId(userId, 1);
      if (achievementStatus.isAchieved) return;
      achievementStatus.updateCount(0);
      await this.achievementStatusRepository.updateOne(achievementStatus);
    }

    async handleFirstLose(userId: string) {
      const achievementStatus = await this.achievementStatusRepository.findOneByUserIdAndAchievementId(userId, 4);
      if (achievementStatus.isAchieved) return;
      achievementStatus.updateCount(achievementStatus.count + 1);
      const achievement = await this.achievementRepository.findOneById(4);
      if (achievementStatus.count >= achievement.criterionNumber) {
        achievementStatus.updateIsAchieved(true);
      }
      await this.achievementStatusRepository.updateOne(achievementStatus);
    }

    async handleThreeLoses(userId: string) {
      const achievementStatus = await this.achievementStatusRepository.findOneByUserIdAndAchievementId(userId, 2);
      if (achievementStatus.isAchieved) return;
      achievementStatus.updateCount(achievementStatus.count + 1);
      const achievement = await this.achievementRepository.findOneById(2);
      if (achievementStatus.count >= achievement.criterionNumber) {
        achievementStatus.updateIsAchieved(true);
      }
      await this.achievementStatusRepository.updateOne(achievementStatus);
    }

    async resetThreeLoses(userId: string) {
      const achievementStatus = await this.achievementStatusRepository.findOneByUserIdAndAchievementId(userId, 2);
      if (achievementStatus.isAchieved) return;
      achievementStatus.updateCount(0);
      await this.achievementStatusRepository.updateOne(achievementStatus);
    }

    async handleDoubleScoreWin(userId: string) {
      const achievementStatus = await this.achievementStatusRepository.findOneByUserIdAndAchievementId(userId, 5);
      if (achievementStatus.isAchieved) return;
      achievementStatus.updateCount(achievementStatus.count + 1);
      const achievement = await this.achievementRepository.findOneById(5);
      if (achievementStatus.count >= achievement.criterionNumber) {
        achievementStatus.updateIsAchieved(true);
      }
      await this.achievementStatusRepository.updateOne(achievementStatus);
    }

    async handleTenMessages(userId: string) {
      const achievementStatus = await this.achievementStatusRepository.findOneByUserIdAndAchievementId(userId, 6);
      if (achievementStatus.isAchieved) return;
      achievementStatus.updateCount(achievementStatus.count + 1);
      const achievement = await this.achievementRepository.findOneById(6);
      if (achievementStatus.count >= achievement.criterionNumber) {
        achievementStatus.updateIsAchieved(true);
      }
      await this.achievementStatusRepository.updateOne(achievementStatus);
    }

    async handleFirstChannel(userId: string) {
      const  achievementStatus = await this.achievementStatusRepository.findOneByUserIdAndAchievementId(userId, 7);
      if (achievementStatus.isAchieved) return;
      achievementStatus.updateCount(achievementStatus.count + 1);
      const achievement = await this.achievementRepository.findOneById(7);
      if (achievementStatus.count >= achievement.criterionNumber) {
        achievementStatus.updateIsAchieved(true);
      }
      await this.achievementStatusRepository.updateOne(achievementStatus);
    }

  async handleFirstMute(userId: string) {
    const achievementStatus = await this.achievementStatusRepository.findOneByUserIdAndAchievementId(userId, 8);
    if (achievementStatus.isAchieved) return;
    achievementStatus.updateCount(achievementStatus.count + 1);
    const achievement = await this.achievementRepository.findOneById(8);
    if (achievementStatus.count >= achievement.criterionNumber) {
      achievementStatus.updateIsAchieved(true);
    }
    await this.achievementStatusRepository.updateOne(achievementStatus);
  }

  async handleFirstBan(userId: string) {
    const achievementStatus = await this.achievementStatusRepository.findOneByUserIdAndAchievementId(userId, 9);
    if (achievementStatus.isAchieved) return;
    achievementStatus.updateCount(achievementStatus.count + 1);
    const achievement = await this.achievementRepository.findOneById(9);
    if (achievementStatus.count >= achievement.criterionNumber) {
      achievementStatus.updateIsAchieved(true);
    }
    await this.achievementStatusRepository.updateOne(achievementStatus);
  }

  async handleFirstKick(userId: string) {
    const achievementStatus = await this.achievementStatusRepository.findOneByUserIdAndAchievementId(userId, 10);
    if (achievementStatus.isAchieved) return;
    achievementStatus.updateCount(achievementStatus.count + 1);
    const achievement = await this.achievementRepository.findOneById(10);
    if (achievementStatus.count >= achievement.criterionNumber) {
      achievementStatus.updateIsAchieved(true);
    }
    await this.achievementStatusRepository.updateOne(achievementStatus);
  }
    
}