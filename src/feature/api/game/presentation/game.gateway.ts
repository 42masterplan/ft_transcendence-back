import { GameState } from './type/game-state';
import { UsePipes } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
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

  async handleConnection(client: any, ...args: any[]) {
    console.log("It's get connected!");
    client.join(this.currentGameKey.toString());
    if (client.rooms[this.currentGameKey.toString()].length === 2) {
      this.currentGameKey++;
      // 두명찼으면 방게임키 업
    }
    client.emit('joinedRoom', this.currentGameKey);
    if (!this.gameStates[this.currentGameKey]) {
      // 현재 게임 키에 해당하는 게임 상태가 없으면 새로 생성합니다. (2명 중 1명이 들어온 경우)
      this.gameStates[this.currentGameKey] = new GameState(this.currentGameKey);
      // this.gameStates[this.currentGameKey].players[0].id = socket.id; // 플레이어 A의 소켓 ID를 초기화합니다.
    } else {
      // 현재 게임 키에 해당하는 게임 상태가 있으면 플레이어 B의 소켓 ID를 초기화합니다.
      // gameStates[currentGameKey].players[1].id = socket.id;
      // gameStates[currentGameKey].ready = true;
      // currentGameKey++; // 다음 게임 키를 위해 게임 키를 1 증가시킵니다.
    }
  }

  handleDisconnect(client: any) {
    console.log("It's get disconnected!");
  }
}
