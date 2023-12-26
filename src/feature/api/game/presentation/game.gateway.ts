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

  async handleConnection(client: any, ...args: any[]) {
    console.log("It's get connected!");
    client.join(this.currentGameKey.toString());
    if (client.rooms[this.currentGameKey.toString()].length === 2) {
      this.currentGameKey++;
      // 두명찼으면 방게임키 업
    }
    client.emit('joinedRoom', this.currentGameKey);
    // 소켓 토큰으로 유저정보 저장하기
    // 유저가 가지고있는 모든 채널에 조인하기
    // const channels = await this.channelService.getMyChannels();
    // client.join(channels.map((channel) => channel.id));
    // client.emit('myChannels', channels);
  }

  handleDisconnect(client: any) {
    console.log("It's get disconnected!");
  }
}
