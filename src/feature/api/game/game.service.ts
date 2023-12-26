import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  private gameStates = {}; // 게임 상태 관리

  // 여기에 게임 로직 메소드 구현
  createNewGameState(matchId: string) {
    // 게임 상태 생성 로직
  }

  updateGameState() {
    // 게임 상태 업데이트 로직
  }
}
