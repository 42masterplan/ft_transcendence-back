import { AuthService } from '../../auth/auth.service';
import { JwtSocketGuard } from '../../auth/jwt/jwt-socket.guard';
import {
  getIntraIdFromSocket,
  getUserFromSocket,
} from '../../auth/tools/socketTools';
import { FriendUseCase } from '../../users/application/friends/friend.use-case';
import { UsersUseCase } from '../../users/application/use-case/users.use-case';
import { UsersService } from '../../users/users.service';
import { DmUseCase } from '../application/dm.use-case';
import {
  OnModuleInit,
  UseGuards,
  UsePipes,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
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
import { io, Socket as ClientSocket } from 'socket.io-client';

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
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly userUseCase: UsersUseCase,
    private readonly dmUseCase: DmUseCase,
    private readonly friendUseCase: FriendUseCase,
  ) {}
  @WebSocketServer()
  private readonly server: Server;
  private sockets: Map<string, string> = new Map();
  private requestQueue: Map<string, MatchStore> = new Map();
  private gameClientSocket: ClientSocket;
  /**
   * 'alarm' 네임스페이스에 연결되었을 때 실행되는 메서드입니다.
   *  유저가 이미 네임스페이스에 연결된 소켓을 가지고 있다면, 이전 소켓을 끊고 새로운 소켓으로 교체합니다.
   */
  async handleConnection(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.auth?.Authorization?.split(' ')[1];
    const user = await this.authService.verifySocket(token);
    if (!user) {
      socket.disconnect();
      return;
    }

    console.log('알림 소켓 연결!!', user);
    //TODO: 두명이 연속으로 접속하는 경우 에러 처리
    if (this.sockets.has(user.id)) {
      console.log('이미 연결된 소켓이 있습니다.');
      socket.emit('error', '이미 연결된 소켓이 있습니다.');
      socket.disconnect();
      return;
    }
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

  onModuleInit() {
    console.log('notification to game');
    this.gameClientSocket = io(process.env.SERVER_URL + '/game', {
      extraHeaders: {
        server_secret_key: process.env.SERVER_SECRET_KEY,
      },
    });
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('gameRequest')
  async handleGameRequest(client, { userId, gameMode, theme }: gameRequest) {
    const receiverSocketId = this.sockets.get(userId);
    const user = await this.usersService.findOneByIntraId(
      getIntraIdFromSocket(client),
    );
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

  @UseGuards(JwtSocketGuard)
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
    const destSocketId = this.sockets.get(matchInfo.destId);
    const userSocketId = this.sockets.get(matchInfo.srcId);
    const srcUser = await this.userUseCase.findOne(matchInfo.srcId);
    const destUser = await this.userUseCase.findOne(matchInfo.destId);
    // 	const userA,B;
    if (isAccept) {
      this.server.to(userSocketId).emit('gameStart', {
        matchId: matchId,
        aName: srcUser.name,
        aProfileImage: srcUser.profileImage,
        bName: destUser.name,
        bProfileImage: destUser.profileImage,
        side: 'A',
        theme: matchInfo.theme,
        gameMode: 'normal',
      });
      this.server.to(destSocketId).emit('gameStart', {
        matchId: matchId,
        aName: srcUser.name,
        aProfileImage: srcUser.profileImage,
        bName: destUser.name,
        bProfileImage: destUser.profileImage,
        side: 'B',
        theme: matchInfo.theme,
        gameMode: 'normal',
      });
      this.gameClientSocket.emit('createRoom', {
        matchId: matchId,
        aId: matchInfo.srcId,
        bId: matchInfo.destId,
        gameMode: 'normal',
      });
    }
    this.requestQueue.delete(matchId);
    return 'gameRequest success!';
    //실패한 경우
    //자유로은 실패 메시지
  }

  @UseGuards(JwtSocketGuard)
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

  /**
   *
   * userName: 받는 사람의 유저 이름
   */
  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('DmHistory')
  async handleDMHistory(client, userName: string) {
    console.log('socket DmHistory');
    const user = await this.usersService.findOneByIntraId(
      getIntraIdFromSocket(client),
    );
    const friend = await this.userUseCase.findOneByName(userName);
    const user1Id = friend.id > user.id ? user.id : friend.id;
    const user2Id = friend.id > user.id ? friend.id : user.id;
    if (
      (await this.friendUseCase.isFriend({
        myId: user1Id,
        friendId: user2Id,
      })) === false
    )
      return 'Not Friend!';
    try {
      const DmHistory = await this.dmUseCase.getDmMessages(user1Id, user2Id);
      return {
        ...DmHistory,
        profileImage: friend.profileImage,
        name: friend.name,
      };
    } catch (e) {
      console.log(e);
      return 'DmHistory Fail!';
    }
  }

  /**
   * dmId : 디엠 방 ID
   * participantId : 메세지를 보낸 유저의 ID
   * content : 보낼 메시지
   */
  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('DmNewMessage')
  async handleDMNewMessage(client, { dmId, participantId, content }) {
    console.log('socket DmNewMessage');
    const user = await this.usersService.findOneByIntraId(
      getIntraIdFromSocket(client),
    );
    try {
      this.dmUseCase.saveNewMessage({ dmId, participantId, content });
      const receiverId = await this.dmUseCase.getReceiverId(dmId, user.id);
      if (
        (await this.friendUseCase.isFriend({
          myId: user.id,
          friendId: receiverId,
        })) === false
      )
        return 'Not Friend!';
      const receiverSocketId = this.sockets.get(receiverId);
      if (receiverSocketId) {
        this.server
          .to(receiverSocketId)
          .emit('DMNewMessage', { dmId, participantId, content });
      }
      return 'DmNewMessage Success!';
    } catch (e) {
      console.log(e);
      return 'DmNewMessage Fail!';
    }
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('myInfo')
  async handleMyInfo(client) {
    console.log('socket myInfo');
    const user = await this.usersService.findOneByIntraId(
      getIntraIdFromSocket(client),
    );
    return {
      profileImage: user.profileImage,
      name: user.name,
      id: user.id,
      introduction: user.introduction,
      currentStatus: user.currentStatus,
    };
  }
}
