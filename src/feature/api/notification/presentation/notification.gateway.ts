import { getUserFromSocket } from '../../auth/tools/socketTools';
import { UsersUseCase } from '../../users/application/use-case/users.use-case';
import { UsersService } from '../../users/users.service';
import { UsePipes, ValidationError, ValidationPipe } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type gameMode = 'normal' | 'ladder';
type theme = 'default' | 'soccer' | 'swimming' | 'badminton' | 'basketball';
type gameRequest = {
  userId: string;
  gameMode: gameMode;
  theme: theme;
};
type gameResponse = {
  matchId: string;
  isAccept: boolean;
};
type gameCancel = {
  matchId: string;
};

type MatchStore = {
  srcId: string;
  destId: string;
  gameMode: gameMode;
  theme: theme;
};

@WebSocketGateway({ namespace: 'alarm' })
@UsePipes(
  new ValidationPipe({
    exceptionFactory(validationErrors: ValidationError[] = []) {
      if (this.isDetailedOutputDisable) {
        return new WsException('');
      }
      const errors = this.flattenValidationErrors(validationErrors);
      console.log(new WsException(errors));
      return new WsException(errors);
    },
  }),
)
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly usersService: UsersService,
    private readonly userUseCase: UsersUseCase,
  ) {}
  @WebSocketServer()
  private readonly server: Server;
  private sockets: Map<string, string> = new Map();
  private requestQueue: Map<string, MatchStore> = new Map();
  /**
   * 'alarm' 네임스페이스에 연결되었을 때 실행되는 메서드입니다.
   *  유저가 이미 네임스페이스에 연결된 소켓을 가지고 있다면, 이전 소켓을 끊고 새로운 소켓으로 교체합니다.
   */
  async handleConnection(@ConnectedSocket() socket: Socket) {
    const user = await getUserFromSocket(socket, this.usersService);

    console.log('알림 소켓 연결!!', user);
    if (!user) {
      socket.disconnect();
      return;
    }
    //TODO: 두명이 연속으로 접속하는 경우 에러 처리
    this.sockets.set(user.id, socket.id);
    this.userUseCase.updateStatus(user.intraId, 'on-line');
  }

  /**
   *
   * 연결이 끊어졌을 때 실행되는 메서드입니다.
   * map에서 해당 유저와 매핑된 소켓 정보를 삭제해줍니다.
   */
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user = await getUserFromSocket(socket, this.usersService);
    if (!user) return;

    this.sockets.delete(user.id);
    this.userUseCase.updateStatus(user.intraId, 'off-line');
  }

  @SubscribeMessage('gameRequest')
  async handleGameRequest(client, { userId, gameMode, theme }: gameRequest) {
    const receiverSocketId = this.sockets.get(userId);
    const user = await getUserFromSocket(client, this.usersService);
    if (!user) return;
    const srcId = user.id; //게임 요청을 보낸 사람의 아이디
    const destId = userId; //요청을 받는 사람의 아이디
    //만약 Map에 이미 srcId와 destId 가 같은 경우가 있다면, 그것을 먼저 pop해준다.
    //이전에 할당된 매칭 큐를 확인해서 pop해준다.
    //MAP으로, 새로운 requestId할당.
    //객체 == [{requestId, userA, userB, theme} ...]
    //두명의 유저에게 gameStart를 동시에 emit해준다.
    const destUser = await this.userUseCase.findOne(userId);
    const matchId = srcId + destId;
    this.requestQueue.set(matchId, { srcId, destId, gameMode, theme });
    console.log(this.requestQueue);

    console.log('socket gameRequest', 'userId: ', userId, gameMode, theme);

    this.server.to(receiverSocketId).emit('gameRequest', {
      profileImage: destUser.profileImage,
      userName: destUser.name,
      matchId: matchId,
      gameMode: gameMode,
      theme: theme,
    });
    console.log('socket gameRequest');
    console.log(this.sockets);
    return { msg: 'gameRequestSuccess!', matchId: matchId };
    //실패한 경우
    //자유로은 실패 메시지
  }

  @SubscribeMessage('gameResponse')
  async handleGameResponse(client, { isAccept, matchId }: gameResponse) {
    //이전에 할당된 매칭 큐를 확인해서 pop해준다.
    //MAP으로, 새로운 requestId할당.
    //객체 == [{requestId, userA, userB, theme} ...]
    //두명의 유저에게 gameStart를 동시에 emit해준다.
    console.log('socket gameResponse');
    console.log(this.requestQueue);
    console.log(isAccept, matchId);
    const matchInfo = this.requestQueue.get(matchId);
    if (!matchInfo && isAccept == true) {
      return 'gameResponse Fail!';
    }
    const userSocketId = this.sockets.get(matchInfo.srcId);
    // 	const userA,B;
    if (isAccept) {
      this.server.to(userSocketId).emit('gameStart', {
        matchId: matchId,
        theme: matchInfo.theme,
      });
    }
    this.requestQueue.delete(matchId);
    return 'gameRequest success!';
    //실패한 경우
    //자유로은 실패 메시지
  }

  @SubscribeMessage('gameCancel')
  async handleGameCancel(client, { matchId }: gameCancel) {
    console.log('socket gameCancel');
    const matchInfo = this.requestQueue.get(matchId);
    console.log(matchInfo);
    const destId = this.sockets.get(matchInfo.destId);
    this.requestQueue.delete(matchId);
    this.server.to(destId).emit('gameCancel', { matchId });
    console.log(this.requestQueue);
    return 'gameCancel Success!';
  }
  @SubscribeMessage('DmHistory')
  async handleDMHistory(client, { userId }) {
    console.log('socket DmHistory');
    const userSocketId = this.sockets.get(userId);
    this.server.to(userSocketId).emit('DMHistory', { userId });
    return 'DmHistory Success!';
  }

  @SubscribeMessage('DmNewMessage')
  async handleDMNewMessage(client, { userId, message, matchId }) {
    console.log('socket DmNewMessage');
    const userSocketId = this.sockets.get(userId);
    this.server
      .to(userSocketId)
      .emit('DMNewMessage', { userId, message, matchId });
    return 'DmNewMessage Success!';
  }
}
