import { AuthService } from '../../auth/auth.service';
import { JwtSocketGuard } from '../../auth/jwt/jwt-socket.guard';
import { getIntraIdFromSocket } from '../../auth/tools/socketTools';
import { GAME_MODE } from '../../game/presentation/type/game-mode.enum';
import { THEME } from '../../game/presentation/type/theme.enum';
import { FriendUseCase } from '../../users/application/friends/friend.use-case';
import { UsersUseCase } from '../../users/application/use-case/users.use-case';
import { UsersService } from '../../users/users.service';
import { DmUseCase } from '../application/dm.use-case';
import { LadderMatch } from './type/ladder-match';
import { LadderMatchQueue } from './type/ladder-match-queue';
import { NormalMatch } from './type/normal-match.type';
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
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly userUseCase: UsersUseCase,
    private readonly dmUseCase: DmUseCase,
    private readonly friendUseCase: FriendUseCase,
  ) {
    this.matchLadderQueue();
    this.tickLadderQueue();
  }
  @WebSocketServer()
  private readonly server: Server;
  private sockets: Map<string, string> = new Map();
  private gameClientSocket: ClientSocket;
  private normalMatchQueue: Map<string, NormalMatch> = new Map();
  private normalQueueMutex: Mutex = new Mutex();
  private ladderQueueMutex: Mutex = new Mutex();
  private ladderMatchQueue: LadderMatchQueue = new LadderMatchQueue();
  private normalMatchId: number = 0;
  private ladderMatchId: number = 0;

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
    if (this.sockets.has(user.id)) return;
    this.sockets.set(user.id, socket.id);
    await this.userUseCase.updateStatus(user.intraId, 'on-line');
    this.server.emit('changeStatus');
  }

  /**
   *
   * 연결이 끊어졌을 때 실행되는 메서드입니다.
   * map에서 해당 유저와 매핑된 소켓 정보를 삭제해줍니다.
   */
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user = await this.usersService.findOneByIntraId(
      getIntraIdFromSocket(socket),
    );
    if (!user) return;
    await this.userUseCase.updateStatus(user.intraId, 'off-line');
    this.handleLadderGameCancel(socket);
    await this.normalQueueMutex.runExclusive(() => {
      for (const [matchId, match] of this.normalMatchQueue) {
        if (match.destId === user.id || match.srcId === user.id) {
          if (match.destId === user.id) {
            const srcId = this.sockets.get(match.srcId);
            console.log('game reject');
            this.server.to(srcId).emit('normalGameReject');
          } else if (match.srcId === user.id) {
            const destId = this.sockets.get(match.destId);
            console.log('game cancel');
            this.server.to(destId).emit('normalGameCancel', { matchId });
          }
          this.normalMatchQueue.delete(matchId);
        }
      }
    });
    this.sockets.delete(user.id);
    await this.userUseCase.updateStatus(user.intraId, 'off-line');
    this.server.emit('changeStatus');
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
  @SubscribeMessage('normalGameRequest')
  async handleNormalGameRequest(client, { userId, theme }: gameRequest) {
    const destSocketId = this.sockets.get(userId);
    const srcSocketId = client.id;
    const srcUser = await this.usersService.findOneByIntraId(
      getIntraIdFromSocket(client),
    );
    const destUser = await this.userUseCase.findOne(userId);
    if (!srcUser || !destUser) return;
    const srcId = srcUser.id; //게임 요청을 보낸 사람의 아이디
    const destId = userId; //요청을 받는 사람의 아이디
    let matchId: string;
    let flag = false;

    if (
      destUser.currentStatus === 'in-game' ||
      destUser.currentStatus === 'off-line'
    ) {
      this.server
        .to(srcSocketId)
        .emit('normalGameReject', '상대방이 게임 가능 상태가 아닙니다.');
      return;
    }
    await this.normalQueueMutex.runExclusive(() => {
      for (const [, match] of this.normalMatchQueue) {
        if (match.destId === destId && match.srcId === srcId) {
          match.theme = theme;
          flag = true;
          return;
        } else if (match.destId === srcId && match.srcId === destId) {
          this.server
            .to(srcSocketId)
            .emit('normalGameReject', '상대방에게서 온 게임이 존재합니다.');
          flag = true;
          return;
        }
      }
      matchId = 'normal-' + this.normalMatchId.toString();
      this.normalMatchId++;
      console.log('game request' + matchId);
      this.normalMatchQueue.set(matchId, {
        srcId,
        destId,
        gameMode: GAME_MODE.normal,
        theme,
      });
    });
    if (flag) return;
    console.log(
      'socket gameRequest',
      'srcUserId',
      srcId,
      'destUserId: ',
      destId,
      'normal',
      theme,
      matchId,
    );

    this.server.to(destSocketId).emit('gameRequest', {
      profileImage: srcUser.profileImage,
      userName: srcUser.name,
      matchId: matchId,
      gameMode: GAME_MODE.normal,
      theme: theme,
    });
    return { msg: 'gameRequestSuccess!', matchId: matchId };
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('ladderGameRequest')
  async handleLadderGameRequest(client) {
    const user = await this.usersService.findOneByIntraId(
      getIntraIdFromSocket(client),
    );
    if (!user) return;
    await this.ladderQueueMutex.runExclusive(() => {
      console.log('ladder game request');
      if (this.ladderMatchQueue.hasUser(user)) {
        console.log('you are already in ladder match queue!');
        return;
      }
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

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('isDoubleLogin')
  async handleDoubleLogin(socket) {
    const user = await this.usersService.findOneByIntraId(
      getIntraIdFromSocket(socket),
    );
    if (!user) return;
    if (this.sockets.has(user.id) && this.sockets.get(user.id) !== socket.id)
      return true;
    return false;
  }
  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('normalGameResponse')
  async handleGameResponse(client, { isAccept, matchId }: gameResponse) {
    console.log('socket gameResponse');
    console.log(this.normalMatchQueue);
    console.log(isAccept, matchId);
    const user = await this.usersService.findOneByIntraId(
      getIntraIdFromSocket(client),
    );
    if (!user) return;
    await this.normalQueueMutex.runExclusive(async () => {
      const matchInfo = this.normalMatchQueue.get(matchId);
      if (!matchInfo || matchInfo.destId !== user.id) return;

      const destSocketId = this.sockets.get(matchInfo.destId);
      const userSocketId = this.sockets.get(matchInfo.srcId);
      const srcUser = await this.userUseCase.findOne(matchInfo.srcId);
      const destUser = await this.userUseCase.findOne(matchInfo.destId);
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
        this.server
          .to(userSocketId)
          .emit('normalGameReject', '상대방이 게임 요청을 거절했습니다.');
      }
      this.normalMatchQueue.delete(matchId);
    });
    return 'gameResponse success!';
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('normalGameCancel')
  async handleNormalGameCancel(client, { matchId }: gameCancel) {
    console.log('socket gameCancel' + matchId);
    const user = await this.usersService.findOneByIntraId(
      getIntraIdFromSocket(client),
    );
    if (!user) return;
    await this.normalQueueMutex.runExclusive(() => {
      const matchInfo = this.normalMatchQueue.get(matchId);
      console.log(matchInfo);
      if (!matchInfo || matchInfo.srcId !== user.id) return;
      const destId = this.sockets.get(matchInfo.destId);
      this.server.to(destId).emit('normalGameCancel', { matchId });
      this.normalMatchQueue.delete(matchId);
      console.log(this.normalMatchQueue);
    });
    return 'gameCancel Success!';
  }

  @SubscribeMessage('ladderGameCancel')
  async handleLadderGameCancel(client) {
    console.log('socket gameCancel');
    await this.ladderQueueMutex.runExclusive(() =>
      this.ladderMatchQueue.removeUserMatch(client.id),
    );
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
    if (!user || !friend) return;
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
    if (content.length >= 512) return 'Dm New message fail: Too long!';
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

  handleSocialUpdate(userId: string) {
    const socketId = this.sockets.get(userId);
    this.server.to(socketId).emit('changeStatus');
  }

  handleNewFriendRequest(userId: string) {
    const socketId = this.sockets.get(userId);
    this.server.to(socketId).emit('newFriendRequest');
  }

  tickLadderQueue() {
    console.log('start tick ladder queue cron');
    setInterval(async () => {
      await this.ladderQueueMutex.runExclusive(async () => {
        this.ladderMatchQueue.tickQueue();
      });
    }, 1000);
  }

  matchLadderQueue() {
    console.log('start update ladder queue cron');
    setInterval(async () => {
      await this.ladderQueueMutex.runExclusive(async () => {
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
            const matchId = 'ladder-' + this.ladderMatchId.toString();
            this.ladderMatchId++;
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
