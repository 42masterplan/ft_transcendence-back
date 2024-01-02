import { getUserFromSocket } from '../../auth/tools/socketTools';
import { GAME_MODE } from '../../game/presentation/type/game-mode.enum';
import { THEME } from '../../game/presentation/type/theme.enum';
import { FriendUseCase } from '../../users/application/friends/friend.use-case';
import { UsersUseCase } from '../../users/application/use-case/users.use-case';
import { UsersService } from '../../users/users.service';
import { DmUseCase } from '../application/dm.use-case';
import { LadderQueueService } from '../application/ladder-queue.service';
import { LadderMatch } from './type/ladder-match';
import { LadderMatchQueue } from './type/ladder-match-queue';
import { NormalMatch } from './type/normal-match.type';
import {
  OnModuleInit,
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
import { Mutex } from 'async-mutex';
import { Server, Socket } from 'socket.io';
import { io, Socket as ClientSocket } from 'socket.io-client';

type gameRequest = {
  userId: string;
  gameMode: GAME_MODE;
  theme: THEME;
};
type gameResponse = {
  matchId: string;
  isAccept: boolean;
};
type gameCancel = {
  matchId: string;
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
    private readonly usersService: UsersService,
    private readonly userUseCase: UsersUseCase,
    private readonly dmUseCase: DmUseCase,
    private readonly friendUseCase: FriendUseCase,
    private readonly ladderQueueService: LadderQueueService,
  ) {
    this.matchLadderQueue();
    this.tickLadderQueue();
  }
  @WebSocketServer()
  private readonly server: Server;
  private sockets: Map<string, string> = new Map();
  private normalRequestQueue: Map<string, NormalMatch> = new Map();
  private ladderRequestQueue: Array<LadderMatch> = [];
  private gameClientSocket: ClientSocket;
  private ladderQueueMutex: Mutex = new Mutex();
  private ladderMatchQueue: LadderMatchQueue = new LadderMatchQueue();

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

  onModuleInit() {
    console.log('notification to game');
    this.gameClientSocket = io(process.env.SERVER_URL + '/game', {
      extraHeaders: {
        server_secret_key: process.env.SERVER_SECRET_KEY,
      },
    });
  }

  @SubscribeMessage('normalGameRequest')
  async handleNormalGameRequest(client, { userId, theme }: gameRequest) {
    const receiverSocketId = this.sockets.get(userId);
    const user = await getUserFromSocket(client, this.usersService);
    if (!user) return;
    const srcId = user.id; //게임 요청을 보낸 사람의 아이디
    const destId = userId; //요청을 받는 사람의 아이디
    const matchId = srcId + destId;
    const destUser = await this.userUseCase.findOne(userId);

    this.normalRequestQueue.set(matchId, {
      srcId,
      destId,
      gameMode: GAME_MODE.normal,
      theme,
    });
    console.log('socket gameRequest', 'userId: ', userId, 'normal', theme);

    this.server.to(receiverSocketId).emit('gameRequest', {
      profileImage: destUser.profileImage,
      userName: destUser.name,
      matchId: matchId,
      gameMode: GAME_MODE.normal,
      theme: theme,
    });
    return { msg: 'gameRequestSuccess!', matchId: matchId };
    //TODO: 실패한 경우
  }

  @SubscribeMessage('ladderGameRequest')
  async handleLadderGameRequest(client) {
    const user = await getUserFromSocket(client, this.usersService);
    if (!user) return;
    await this.ladderQueueMutex.runExclusive(() => {
      console.log('ladder game request');
      this.ladderMatchQueue.insert(
        new LadderMatch({
          id: user.id,
          socketId: client.id,
          tier: user.tier,
          exp: user.exp,
        }),
      );
    });
    return { msg: 'gameRequestSuccess!' };
  }

  @SubscribeMessage('normalGameResponse')
  async handleGameResponse(client, { isAccept, matchId }: gameResponse) {
    //이전에 할당된 매칭 큐를 확인해서 pop해준다.
    //MAP으로, 새로운 requestId할당.
    //객체 == [{requestId, userA, userB, theme} ...]
    //두명의 유저에게 gameStart를 동시에 emit해준다.
    console.log('socket gameResponse');
    console.log(this.normalRequestQueue);
    console.log(isAccept, matchId);
    const user = await getUserFromSocket(client, this.usersService);
    if (!user) return;
    const matchInfo = this.normalRequestQueue.get(matchId);
    if (!matchInfo || matchInfo.destId !== user.id) return;

    const destSocketId = this.sockets.get(matchInfo.destId);
    const userSocketId = this.sockets.get(matchInfo.srcId);
    const srcUser = await this.userUseCase.findOne(matchInfo.srcId);
    const destUser = await this.userUseCase.findOne(matchInfo.destId);
    // 	const userA,B;
    if (isAccept) {
      console.log('game accept');
      this.server.to(userSocketId).emit('gameStart', {
        matchId: matchId,
        aName: srcUser.name,
        aProfileImage: srcUser.profileImage,
        bName: destUser.name,
        bProfileImage: destUser.profileImage,
        side: 'A',
        theme: matchInfo.theme,
        gameMode: GAME_MODE.normal,
      });
      this.server.to(destSocketId).emit('gameStart', {
        matchId: matchId,
        aName: srcUser.name,
        aProfileImage: srcUser.profileImage,
        bName: destUser.name,
        bProfileImage: destUser.profileImage,
        side: 'B',
        theme: matchInfo.theme,
        gameMode: GAME_MODE.normal,
      });
      this.gameClientSocket.emit('createRoom', {
        matchId: matchId,
        aId: matchInfo.srcId,
        bId: matchInfo.destId,
        gameMode: GAME_MODE.normal,
      });
    } else {
      console.log('game reject');
      this.server.to(userSocketId).emit('normalGameReject');
    }
    this.normalRequestQueue.delete(matchId);
    return 'gameResponse success!';
    //실패한 경우
    //자유로은 실패 메시지
  }

  @SubscribeMessage('normalGameCancel')
  async handleNormalGameCancel(client, { matchId }: gameCancel) {
    console.log('socket gameCancel');
    const user = await getUserFromSocket(client, this.usersService);
    if (!user) return;
    const matchInfo = this.normalRequestQueue.get(matchId);
    console.log(matchInfo);
    if (!matchInfo || matchInfo.srcId !== user.id) return;
    const destId = this.sockets.get(matchInfo.destId);
    this.server.to(destId).emit('normalGameCancel', { matchId });
    this.normalRequestQueue.delete(matchId);
    console.log(this.normalRequestQueue);
    return 'gameCancel Success!';
  }

  @SubscribeMessage('ladderGameCancel')
  async handleLadderGameCancel(client) {
    console.log('socket gameCancel');
    this.ladderQueueMutex.runExclusive(() =>
      this.ladderMatchQueue.removeUserMatch(client.id),
    );
    return 'gameCancel Success!';
  }

  /**
   *
   * userName: 받는 사람의 유저 이름
   */
  @SubscribeMessage('DmHistory')
  async handleDMHistory(client, userName: string) {
    console.log('socket DmHistory');
    const user = await getUserFromSocket(client, this.usersService);
    if (!user) return 'DmHistory Fail!';

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
  @SubscribeMessage('DmNewMessage')
  async handleDMNewMessage(client, { dmId, participantId, content }) {
    console.log('socket DmNewMessage');
    const user = await getUserFromSocket(client, this.usersService);
    if (!user) return 'DmNewMessage Fail!';
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

  @SubscribeMessage('myInfo')
  async handleMyInfo(client) {
    console.log('socket myInfo');
    const user = await getUserFromSocket(client, this.usersService);
    if (!user) return 'myInfo Fail!';
    return {
      profileImage: user.profileImage,
      name: user.name,
      id: user.id,
      introduction: user.introduction,
      currentStatus: user.currentStatus,
    };
  }

  tickLadderQueue() {
    console.log('start tick ladder queue cron');
    setInterval(async () => {
      this.ladderQueueMutex.runExclusive(async () => {
        this.ladderMatchQueue.tickQueue();
      });
    }, 1000);
  }

  matchLadderQueue() {
    console.log('start update ladder queue cron');
    setInterval(async () => {
      this.ladderQueueMutex.runExclusive(async () => {
        const matchArray: Array<LadderMatch> =
          this.ladderMatchQueue.getMatchArrayByTime();
        for (const match of matchArray) {
          console.log('check about' + match.id);
          if (!match || match.removed === true) continue;
          let prevMatch: LadderMatch = match.prev;
          while (prevMatch && prevMatch.removed === true) {
            prevMatch = prevMatch.prev;
          }
          let nextMatch: LadderMatch = match.next;
          while (nextMatch && nextMatch.removed === true) {
            nextMatch = nextMatch.next;
          }
          const matchPoint = match.tierNum * 100 + match.exp;
          const prevMatchPoint = prevMatch
            ? prevMatch.tierNum * 100 + prevMatch.exp
            : 0;
          const nextMatchPoint = nextMatch
            ? nextMatch.tierNum * 100 + nextMatch.exp
            : 0;
          let canMatchOtherTier = false;
          let canMatchWithPrev = false;
          let canMatchWithNext = false;
          let result: LadderMatch;

          const matchRange = match.time * 10;
          if (match.exp + matchRange >= 100 && match.exp - matchRange < 0) {
            canMatchOtherTier = true;
          }
          if (
            prevMatch &&
            prevMatchPoint <= matchPoint + matchRange &&
            prevMatchPoint >= matchPoint - matchRange
          ) {
            if (canMatchOtherTier) canMatchWithPrev = true;
            else if (prevMatch.tier === match.tier) canMatchWithPrev = true;
          }
          if (
            nextMatch &&
            nextMatchPoint <= matchPoint + matchRange &&
            nextMatchPoint >= matchPoint - matchRange
          ) {
            if (canMatchOtherTier) canMatchWithNext = true;
            else if (nextMatch.tier === match.tier) canMatchWithNext = true;
          }
          if (canMatchWithPrev || canMatchWithNext) {
            if (canMatchWithPrev && canMatchWithNext) {
              if (
                prevMatch.tier === match.tier &&
                nextMatch.tier === match.tier
              ) {
                result =
                  prevMatch.time < nextMatch.time ? nextMatch : prevMatch;
              } else {
                result = prevMatch.tier === match.tier ? prevMatch : nextMatch;
              }
            } else if (canMatchWithPrev) result = prevMatch;
            else result = nextMatch;
            console.log('match success!' + match.id + ' vs ' + result.id);

            const playerA = await this.userUseCase.findOne(match.id);
            const playerB = await this.userUseCase.findOne(result.id);
            const matchId = match.id + result.id;
            this.server.to(match.socketId).emit('gameStart', {
              matchId: matchId,
              aName: playerA.name,
              aProfileImage: playerA.profileImage,
              bName: playerB.name,
              bProfileImage: playerB.profileImage,
              side: 'A',
              theme: THEME.default,
              gameMode: GAME_MODE.ladder,
            });
            this.server.to(result.socketId).emit('gameStart', {
              matchId: matchId,
              aName: playerA.name,
              aProfileImage: playerA.profileImage,
              bName: playerB.name,
              bProfileImage: playerB.profileImage,
              side: 'B',
              theme: THEME.default,
              gameMode: GAME_MODE.ladder,
            });
            this.gameClientSocket.emit('createRoom', {
              matchId: matchId,
              aId: playerA.id,
              bId: playerB.id,
              gameMode: GAME_MODE.ladder,
            });

            this.ladderMatchQueue.remove(match);
            this.ladderMatchQueue.remove(result);
            return;
          } else if (
            matchPoint - matchRange < 0 &&
            matchPoint + matchRange >= 400
          ) {
            console.log('there is no match for ' + match.id + ', reject game');
            this.server.to(match.socketId).emit('ladderGameReject');
            this.ladderMatchQueue.remove(match);
            return;
          }
        }
      });
    }, 500);
  }
}
