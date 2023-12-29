import { GameState } from './type/game-state';
import {
  DEBOUNCING_TIME,
  GAME_STATE_UPDATE_RATE,
  PADDLE_OFFSET,
  PLAYER_A_COLOR,
  PLAYER_WIDTH,
  SCORE_LIMIT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from './util';
import { BallViewModel } from './view-model/ball.vm';
import { GameStateViewModel } from './view-model/game-state.vm';
import { UsePipes } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'game' })
@UsePipes()
// new ValidationPipe({
//   exceptionFactory(validationErrors: ValidationError[] = []) {
//     if (this.isDetailedOutputDisable) {
//       return new WsException('');
//     }
//     const errors = this.flattenValidationErrors(validationErrors);
//     console.log(new WsException(errors));
//     return new WsException(errors);
//   },
// }),
// DTO를 검증하는 ValidationPipe를 사용할 수 있다.
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private currentGameKey: number = 0;
  private gameStates: GameState[] = [];

  @WebSocketServer()
  server;
  constructor() {}

  handleConnection(client: any, ...args: any[]) {
    console.log('Game is get connected!');
    const matchId = this.currentGameKey.toString();
    client.join(matchId);
    client.emit('joinedRoom', matchId);
    // TODO: game 참가 로직 변경
    if (!this.gameStates[this.currentGameKey]) {
      // 현재 게임 키에 해당하는 게임 상태가 없으면 새로 생성합니다. (2명 중 1명이 들어온 경우)
      console.log('create new match');
      this.gameStates[this.currentGameKey] = new GameState(matchId);
      this.gameStates[this.currentGameKey].playerA.id = client.id; // 플레이어 A의 소켓 ID를 초기화합니다.
    } else {
      // 현재 게임 키에 해당하는 게임 상태가 있으면 플레이어 B의 소켓 ID를 초기화합니다.
      console.log('you join the match');
      this.gameStates[this.currentGameKey].playerB.id = client.id; // 플레이어 A의 소켓 ID를 초기화합니다.
      this.gameStates[this.currentGameKey].isReady = true;
      this.updateGameStateCron();
      this.updateGameTimeCron();
      this.currentGameKey++; // 다음 게임 키를 위해 게임 키를 1 증가시킵니다.
    }
  }

  handleDisconnect(client: any) {
    console.log('Game is get disconnected!');
    const matchIndex = this.gameStates.findIndex((state) => {
      if (state.playerA.id === client.id || state.playerB.id === client.id)
        return true;
      return false;
    });
    if (matchIndex === -1) console.error('this should not happen'); // 게임 룸을 찾지 못하면 에러를 출력합니다. (로직상 불가능합니다 ;)..
    if (!this.gameStates[matchIndex].isReady) {
      // 1명이 들어왔는데 두 번째 플레이어가 들어오기 전에 연결이 끊긴 경우 게임 상태를 삭제합니다.
      // TODO: 로직 확인
      delete this.gameStates[matchIndex];
      return;
    }
    // 플레이어 A가 연결을 끊으면 플레이어 B가 기권승합니다.
    const state: GameState = this.gameStates[matchIndex];
    if (state.playerA.id === client.id) {
      state.score.playerB = SCORE_LIMIT;
      state.isForfeit = true;

      this.server
        .to(state.matchId)
        .emit('updateScore', new GameStateViewModel(state));
      this.server
        .to(state.matchId)
        .emit('gameOver', new GameStateViewModel(state));
    }
    // 플레이어 B가 연결을 끊으면 플레이어 A가 기권승합니다.
    else if (state.playerB.id === client.id) {
      state.score.playerA = SCORE_LIMIT;
      state.isForfeit = true;
      this.server
        .to(state.matchId)
        .emit('updateScore', new GameStateViewModel(state));
      this.server
        .to(state.matchId)
        .emit('gameOver', new GameStateViewModel(state));
    }
  }

  @SubscribeMessage('keyDown')
  playerKeyDown(client: Socket, { keycode }) {
    const matchIndex = this.gameStates.findIndex((state) => {
      if (state.playerA.id === client.id || state.playerB.id === client.id)
        return true;
      return false;
    });
    if (matchIndex === -1) console.error('this should not happen'); // 게임 룸을 찾지 못하면 에러를 출력합니다. (로직상 불가능합니다 ;)..
    const state = this.gameStates[matchIndex];
    const targetPlayer =
      state.playerA.id === client.id ? state.playerA : state.playerB;
    if (targetPlayer.id === '') return;
    const isA = targetPlayer.color === PLAYER_A_COLOR;
    // 키에 따라 플레이어의 위치를 업데이트합니다. 화면 중앙 가까이 한계선을 설정해서 넘어가지 않도록 합니다.
    // 플레이어가 움직이고 있기 때문에 dx를 업데이트합니다. (스핀 적용을 위해서 필요합니다. dy는 사용하지 않습니다.)
    switch (keycode) {
      case 'a': {
        if (targetPlayer.x > 0) {
          targetPlayer.x -= PADDLE_OFFSET;
          targetPlayer.dx = -PADDLE_OFFSET;
        }
        break;
      }
      case 'd': {
        if (targetPlayer.x < SCREEN_WIDTH - targetPlayer.width) {
          targetPlayer.x += PADDLE_OFFSET;
          targetPlayer.dx = PADDLE_OFFSET;
        }
        break;
      }
      case 'w': {
        if (!isA && targetPlayer.y > 0) targetPlayer.y -= PADDLE_OFFSET / 2;
        else if (
          isA &&
          targetPlayer.y > (SCREEN_HEIGHT / 3) * 2 - targetPlayer.height
        )
          targetPlayer.y -= PADDLE_OFFSET / 2;
        break;
      }
      case 's': {
        if (!isA && targetPlayer.y < SCREEN_HEIGHT / 3 - targetPlayer.height) {
          targetPlayer.y += PADDLE_OFFSET / 2;
        } else if (isA && targetPlayer.y < SCREEN_HEIGHT - targetPlayer.height)
          targetPlayer.y += PADDLE_OFFSET / 2;
        break;
      }
    }
  }

  @SubscribeMessage('keyUp')
  playerKeyUp(client: Socket) {
    const matchIndex = this.gameStates.findIndex((state) => {
      if (state.playerA.id === client.id || state.playerB.id === client.id)
        return true;
      return false;
    });
    if (matchIndex === -1) console.error('this should not happen'); // 게임 룸을 찾지 못하면 에러를 출력합니다. (로직상 불가능합니다 ;)..
    const state = this.gameStates[matchIndex];
    const targetPlayer =
      state.playerA.id === client.id ? state.playerA : state.playerB;
    if (targetPlayer.id === '') return;
    targetPlayer.dx = 0;
  }

  private updateGameState(state: GameState) {
    // 현재 속도에 따라 공의 위치를 업데이트합니다.
    state.ball.x += state.ball.velocity.x;
    state.ball.y += state.ball.velocity.y;

    // 공이 벽에 부딪히면 반사각을 계산하여 적용합니다.
    if (
      state.ball.x - state.ball.radius <= 1 ||
      state.ball.x + state.ball.radius >= SCREEN_WIDTH - 1
    )
      state.ball.velocity.x *= -1;
    // 공이 화면 위 아래에 닿으면 점수를 획득하고 공을 초기화합니다.
    else if (state.ball.y < 0) this.resetBall(true, state); // A 점수 획득
    else if (state.ball.y > SCREEN_HEIGHT) this.resetBall(false, state); // B 점수 획득
    // 플레이어와 충돌하면 충돌 시간을 업데이트하고 반사각을 계산하여 적용합니다.
    // 충돌 시간이 DEBOUNCING_TIME보다 작으면 충돌을 무시합니다. (무한 충돌 이벤트 발생 방지)
    if (
      state.playerA.isCollided(state.ball) ||
      state.playerB.isCollided(state.ball)
    ) {
      const now = Date.now();
      if (
        state.ball.lastCollision &&
        now - state.ball.lastCollision < DEBOUNCING_TIME
      )
        return;
      if (state.playerA.isCollided(state.ball))
        state.playerA.handleCollision(state.ball, now);
      else if (state.playerB.isCollided(state.ball))
        state.playerB.handleCollision(state.ball, now);
    }
  }

  private resetBall(isA: boolean, state: GameState) {
    if (isA) state.score.playerA++;
    else state.score.playerB++;
    this.server
      .to(state.matchId)
      .emit('updateScore', new GameStateViewModel(state));
    if (
      (!state.isDeuce && state.score.playerA === SCORE_LIMIT) ||
      state.score.playerB === SCORE_LIMIT
    ) {
      this.server
        .to(state.matchId)
        .emit('gameOver', new GameStateViewModel(state));
      this.server.socketsLeave(state.matchId);
      return;
    } else if (
      state.isDeuce &&
      Math.abs(state.score.playerA - state.score.playerB) >= 2
    ) {
      this.server
        .to(state.matchId)
        .emit('gameOver', new GameStateViewModel(state));
      this.server.socketsLeave(state.matchId);
      return;
    }
    state.ball.x = SCREEN_WIDTH / 2;
    state.ball.y = SCREEN_HEIGHT / 2;
    state.ball.velocity.x = 0;
    state.ball.velocity.y = 0;
    setTimeout(() => {
      const x = !isA
        ? state.playerA.x + PLAYER_WIDTH / 2
        : state.playerB.x + PLAYER_WIDTH / 2;
      const y = !isA ? state.playerA.y : state.playerB.y;
      const dx = x - state.ball.x;
      const dy = y - state.ball.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      const ret_x = (dx / speed) * state.ball.speed;
      const ret_y = (dy / speed) * state.ball.speed;
      state.ball.velocity.x = ret_x;
      state.ball.velocity.y = ret_y;
      this.server
        .to(state.matchId)
        .emit('updateBall', new GameStateViewModel(state));
    }, 3000);
  }

  updateGameStateCron() {
    console.log('start update game state cron');
    const gameStateCronJob = () => {
      this.gameStates.forEach((state) => {
        if (!state.isReady) return; // 아직 게임이 시작되지 않은 상태라면 업데이트하지 않습니다.
        this.updateGameState(state);
        console.log(new BallViewModel(state.ball));
        this.server
          .to(state.matchId)
          .emit('updatePlayers', new GameStateViewModel(state)); // 플레이어의 위치를 업데이트합니다.
        this.server
          .to(state.matchId)
          .emit('updateBall', new GameStateViewModel(state));
      });
      setTimeout(gameStateCronJob, GAME_STATE_UPDATE_RATE);
    };
    // 초기 실행
    setTimeout(gameStateCronJob, GAME_STATE_UPDATE_RATE);
  }

  updateGameTimeCron() {
    console.log('start update game time cron');
    const timerId = setTimeout(() => {
      this.gameStates.forEach((state) => {
        state.time--;
        if (!state.isReady) return;
        if (state.time <= 0) {
          if (state.score.playerA > state.score.playerB)
            this.server
              .to(state.matchId)
              .emit('gameOver', new GameStateViewModel(state));
          else if (state.score.playerA < state.score.playerB)
            this.server
              .to(state.matchId)
              .emit('gameOver', new GameStateViewModel(state));
          else {
            // 듀스!! 공의 속력이 1.5배로 증가합니다. 먼저 2점차를 만들면 승리합니다.
            state.isDeuce = true;
            state.ball.velocity.x *= 1.5;
            state.ball.velocity.y *= 1.5;
            state.ball.speed *= 1.5;
            this.server
              .to(state.matchId)
              .emit('deuce', new GameStateViewModel(state));
            clearInterval(timerId);
            return;
          }
          clearInterval(timerId);
          this.server.socketsLeave(state.matchId);
          return;
        }

        this.server
          .to(state.matchId)
          .emit('updateTime', new GameStateViewModel(state));
      });
    }, 1000);
  }
}
