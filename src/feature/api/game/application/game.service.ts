import { GameState } from '../presentation/type/game-state';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  getMatchId(gameStates: GameState[]): string {
    return gameStates.length.toString();
  }

  joinMatch(gameStates: GameState[], matchId: string, clientId: string) {
    let gameState = gameStates.at(-1);

    if (gameState.playerB.id !== '') {
      console.log('create new match');
      gameStates.push(new GameState(matchId));
      gameState = gameStates.at(-1);
      gameState.playerA.id = clientId;
    } else {
      // 현재 게임 키에 해당하는 게임 상태가 있으면 플레이어 B의 소켓 ID를 초기화합니다.
      console.log('you join the match');
      gameState.playerB.id = clientId;
      gameState.isReady = true;
    }
  }

  startMatch() {}
}
