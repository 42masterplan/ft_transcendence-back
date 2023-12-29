import { Ball } from '../presentation/type/ball';
import { GameState } from '../presentation/type/game-state';
import { Player } from '../presentation/type/player';
import {
  DEBOUNCING_TIME,
  PADDLE_OFFSET,
  PLAYER_WIDTH,
  SCORE_LIMIT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from '../presentation/util';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  getNewMatchId(gameStates: GameState[]): string {
    const matchIndex = gameStates.length - 1;
    if (!gameStates.length) return '0';
    if (gameStates[matchIndex].playerB.id === '') return matchIndex.toString();
    return (matchIndex + 1).toString();
  }

  joinMatch(
    gameStates: GameState[],
    matchId: string,
    clientId: string,
  ): GameState[] {
    // TODO: game 참가 로직 변경
    let gameState = gameStates.at(-1);

    if (!gameStates.length || gameState.playerB.id !== '') {
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
    return gameStates;
  }

  startMatch() {}

  getMatch(gameStates: GameState[], clientId: string): GameState {
    const matchIndex = gameStates.findIndex((state) => {
      if (state.playerA.id === clientId || state.playerB.id === clientId)
        return true;
      return false;
    });
    if (matchIndex === -1) console.error('this should not happen'); // 게임 룸을 찾지 못하면 에러를 출력합니다. (로직상 불가능합니다 ;)..
    return gameStates[matchIndex];
  }

  getMe(gameState: GameState, clientId: string): Player {
    return gameState.playerA.id === clientId
      ? gameState.playerA
      : gameState.playerB;
  }

  deleteMatch(gameStates: GameState[], match: GameState) {
    const matchIndex = gameStates.findIndex((state) => {
      if (state.matchId === match.matchId) return true;
      return false;
    });
    delete gameStates[matchIndex];
    gameStates.splice(matchIndex, 1);
    //TODO: delete 필요?
  }

  matchForfeit(match: GameState, losePlayerId: string) {
    if (match.playerA.id === losePlayerId) match.score.playerB = SCORE_LIMIT;
    else if (match.playerB.id === losePlayerId)
      match.score.playerA = SCORE_LIMIT;
    match.isForfeit = true;
    //TODO: 저장 후 delete
  }

  movePlayer(player: Player, isA: boolean, keycode: string) {
    // 키에 따라 플레이어의 위치를 업데이트합니다. 화면 중앙 가까이 한계선을 설정해서 넘어가지 않도록 합니다.
    // 플레이어가 움직이고 있기 때문에 dx를 업데이트합니다. (스핀 적용을 위해서 필요합니다. dy는 사용하지 않습니다.)
    switch (keycode) {
      case 'a': {
        if (player.x > 0) {
          player.x -= PADDLE_OFFSET;
          player.dx = -PADDLE_OFFSET;
        }
        break;
      }
      case 'd': {
        if (player.x < SCREEN_WIDTH - player.width) {
          player.x += PADDLE_OFFSET;
          player.dx = PADDLE_OFFSET;
        }
        break;
      }
      case 'w': {
        if (!isA && player.y > 0) player.y -= PADDLE_OFFSET / 2;
        else if (isA && player.y > (SCREEN_HEIGHT / 3) * 2 - player.height)
          player.y -= PADDLE_OFFSET / 2;
        break;
      }
      case 's': {
        if (!isA && player.y < SCREEN_HEIGHT / 3 - player.height) {
          player.y += PADDLE_OFFSET / 2;
        } else if (isA && player.y < SCREEN_HEIGHT - player.height)
          player.y += PADDLE_OFFSET / 2;
        break;
      }
    }
  }

  moveBall(ball: Ball): string {
    ball.x += ball.velocity.x;
    ball.y += ball.velocity.y;

    // 공이 벽에 부딪히면 반사각을 계산하여 적용합니다.
    if (ball.x - ball.radius <= 1 || ball.x + ball.radius >= SCREEN_WIDTH - 1)
      ball.velocity.x *= -1;
    else if (ball.y < 0) return 'A';
    else if (ball.y > SCREEN_HEIGHT) return 'B';
    return '';
  }

  isGameOver(state: GameState): boolean {
    if (
      (!state.isDeuce && state.score.playerA === SCORE_LIMIT) ||
      state.score.playerB === SCORE_LIMIT ||
      (state.isDeuce &&
        Math.abs(state.score.playerA - state.score.playerB) >= 2)
    )
      return true;
    return false;
  }

  resetBall(ball: Ball) {
    ball.x = SCREEN_WIDTH / 2;
    ball.y = SCREEN_HEIGHT / 2;
    ball.velocity.x = 0;
    ball.velocity.y = 0;
  }

  readyBall(ball: Ball, winner: Player) {
    const x = winner.x + PLAYER_WIDTH / 2;
    const y = winner.y;
    const dx = x - ball.x;
    const dy = y - ball.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    const ret_x = (dx / speed) * ball.speed;
    const ret_y = (dy / speed) * ball.speed;
    ball.velocity.x = ret_x;
    ball.velocity.y = ret_y;
  }

  handleCollision(ball: Ball, playerA: Player, playerB: Player) {
    if (playerA.isCollided(ball) || playerB.isCollided(ball)) {
      const now = Date.now();
      if (ball.lastCollision && now - ball.lastCollision < DEBOUNCING_TIME)
        return;
      if (playerA.isCollided(ball)) playerA.handleCollision(ball, now);
      else if (playerB.isCollided(ball)) playerB.handleCollision(ball, now);
    }
  }

  updateTimeAndCheckFinish(state: GameState): boolean {
    state.time--;
    if (state.time <= 0) return true;
    return false;
  }

  setDeuce(state: GameState) {
    // 듀스!! 공의 속력이 1.5배로 증가합니다. 먼저 2점차를 만들면 승리합니다.
    state.isDeuce = true;
    state.ball.velocity.x *= 1.5;
    state.ball.velocity.y *= 1.5;
    state.ball.speed *= 1.5;
  }
}
