import { GameState } from './type/game-state';
import { SCORE_LIMIT } from './util';
import { UsePipes } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

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

  async handleConnection(client: any, ...args: any[]) {
    console.log("It's get connected!");
    client.join(this.currentGameKey.toString());
    if (client.rooms[this.currentGameKey.toString()].length === 2) {
      this.currentGameKey++;
      // 두명찼으면 방게임키 업
    }
    client.emit('joinedRoom', this.currentGameKey);
    // TODO: game 참가 로직 변경
    if (!this.gameStates[this.currentGameKey]) {
      // 현재 게임 키에 해당하는 게임 상태가 없으면 새로 생성합니다. (2명 중 1명이 들어온 경우)
      this.gameStates[this.currentGameKey] = new GameState(this.currentGameKey);
      this.gameStates[this.currentGameKey].playerA.id = client.id; // 플레이어 A의 소켓 ID를 초기화합니다.
    } else {
      // 현재 게임 키에 해당하는 게임 상태가 있으면 플레이어 B의 소켓 ID를 초기화합니다.
      this.gameStates[this.currentGameKey].playerB.id = client.id; // 플레이어 A의 소켓 ID를 초기화합니다.
      this.gameStates[this.currentGameKey].isReady = true;
      this.currentGameKey++; // 다음 게임 키를 위해 게임 키를 1 증가시킵니다.
    }
  }

  handleDisconnect(client: any) {
    console.log("It's get disconnected!");
    const roomId = Object.keys(this.gameStates).find((id) => {
      const state: GameState = this.gameStates[id];
      if (state.playerA.id === client.id || state.playerB.id === client.id)
        return true;
      return false;
    });
    if (!roomId) console.error('this should not happen'); // 게임 룸을 찾지 못하면 에러를 출력합니다. (로직상 불가능합니다 ;)..
    if (!this.gameStates[roomId].ready) {
      // 1명이 들어왔는데 두 번째 플레이어가 들어오기 전에 연결이 끊긴 경우 게임 상태를 삭제합니다.
      delete this.gameStates[roomId];
      return;
    }
    // 플레이어 A가 연결을 끊으면 플레이어 B가 기권승합니다.
    const state: GameState = this.gameStates[roomId];
    if (state.playerA.id === client.id) {
      state.score.playerB = SCORE_LIMIT;
      state.isForfeit = true;

      this.server.to(state.matchId).emit('updateScore', state);
      this.server.to(state.matchId).emit('gameOver', state);
    }
    // 플레이어 B가 연결을 끊으면 플레이어 A가 기권승합니다.
    else if (state.playerB.id === client.id) {
      state.score.playerA = SCORE_LIMIT;
      state.isForfeit = true;
      this.server.to(state.matchId).emit('updateScore', state);
      this.server.to(state.matchId).emit('gameOver', state);
    }
  }
}
