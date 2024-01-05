import { Game } from '@/src/feature/api/game/domain/game';

export class MatchViewModel {
  readonly gameId: number;
  readonly playerAName: string;
  readonly playerBName: string;
  readonly playerAScore: number;
  readonly playerBScore: number;
  readonly createdAt: string;

  constructor(param: Game) {
    this.gameId = param.id;
    this.playerAName = param.playerA.user.name;
    this.playerBName = param.playerB.user.name;
    this.playerAScore = param.playerA.score;
    this.playerBScore = param.playerB.score;
    this.createdAt = this.getDateString(param.createdAt);
  }

  private getDateString(date: Date): string {
    const offset = 1000 * 60 * 60 * 9;
    const korDate = new Date(date.getTime() + offset);
    const year = korDate.getFullYear().toString();
    const month = (korDate.getMonth() + 1).toString();
    const day = korDate.getDate().toString();
    console.log(korDate.getHours(), korDate.getMinutes());

    return year + '-' + month + '-' + day;
  }
}
