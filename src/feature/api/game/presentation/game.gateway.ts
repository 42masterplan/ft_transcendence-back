import { AuthService } from '../../auth/auth.service';
import { JwtSocketGuard } from '../../auth/jwt/jwt-socket.guard';
import { getIntraIdFromSocket } from '../../auth/tools/socketTools';
import { NotificationGateway } from '../../notification/presentation/notification.gateway';
import { AchievementUseCase } from '../../users/application/use-case/achievement.use-case';
import { UsersUseCase } from '../../users/application/use-case/users.use-case';
import { GameService } from '../application/game.service';
import { GameUseCase } from '../application/game.use-case';
import { GAME_MODE } from './type/game-mode.enum';
import { GameState } from './type/game-state';
import { GAME_STATE_UPDATE_RATE, PLAYER_A_COLOR, SCORE_LIMIT } from './util';
import { GameStateViewModel } from './view-model/game-state.vm';
import {
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
} from '@nestjs/websockets';
import { Mutex } from 'async-mutex';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'game' })
@UsePipes(
  new ValidationPipe({
    exceptionFactory(validationErrors: ValidationError[] = []) {
      if (this.isDetailedOutputDisable) {
        return new WsException('');
      }
      const errors = this.flattenValidationErrors(validationErrors);
      // console.log(new WsException(errors));
      return new WsException(errors);
    },
  }),
)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private gameStateMutexes: Map<string, Mutex> = new Map();
  private gameStates: Map<string, GameState> = new Map();
  private gameTimeCrons: Map<string, ReturnType<typeof setInterval>> =
    new Map();
  private gameStateCrons: Map<string, ReturnType<typeof setInterval>> =
    new Map();
  private joinMutex = new Mutex();
  private notificationSocket: Socket;

  @WebSocketServer()
  private readonly server: Server;
  constructor(
    private readonly authService: AuthService,
    private readonly gameService: GameService,
    private readonly gameUseCase: GameUseCase,
    private readonly usersUseCase: UsersUseCase,
    private readonly achievementUseCase: AchievementUseCase,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async handleConnection(client: any) {
    if (
      client.handshake.headers.server_secret_key ===
      process.env.SERVER_SECRET_KEY
    ) {
      // console.log('Hi, you are server!');
      this.notificationSocket = client;
    } else {
      const token = client.handshake.auth?.Authorization?.split(' ')[1];
      const user = await this.authService.verifySocket(token);
      let flag = true;

      if (!user) {
        client.disconnect();
        return;
      }
      await this.joinMutex.runExclusive(() => {
        if (this.gameService.getMyMatchId(this.gameStates, user.id) === null) {
          client.disconnect();
          flag = false;
          return;
        }
      });
      if (!flag) return;
      await this.usersUseCase.updateStatusByIntraId(user.intraId, 'in-game');
      this.notificationGateway.handleSocialUpdateToServer();
    }
    // console.log('Game is get connected!');
  }

  async handleDisconnect(client: any) {
    // console.log('Game is get disconnected!');
    const user = await this.usersUseCase.findOneByIntraId(
      getIntraIdFromSocket(client),
    );
    if (!user) return;

    await this.joinMutex.runExclusive(async () => {
      const matchId = this.gameService.getMyMatchIdBySocket(
        this.gameStates,
        client.id,
      );
      if (!matchId) return;
      const mutex = this.gameStateMutexes.get(matchId);
      if (!mutex) return;

      await mutex.runExclusive(async () => {
        const match = this.gameStates.get(matchId);
        if (!match) return;
        this.gameService.matchForfeit(match, client.id);
        this.server
          .to(matchId)
          .emit('updateScore', new GameStateViewModel(match));
        clearInterval(this.gameStateCrons.get(matchId));
        clearInterval(this.gameTimeCrons.get(matchId));
        this.server.to(matchId).emit('gameOver', new GameStateViewModel(match));
        await this.gameUseCase.saveGame({
          playerAId: match.playerA.id,
          playerBId: match.playerB.id,
          playerAScore: match.score.playerA,
          playerBScore: match.score.playerB,
          isLadder: match.gameMode === GAME_MODE.normal ? false : true,
        });

        if (match.resetTimeout !== null) clearTimeout(match.resetTimeout);
        if (this.notificationGateway.getSocketById(match.playerA.id))
          await this.usersUseCase.updateStatusById(match.playerA.id, 'on-line');
        if (this.notificationGateway.getSocketById(match.playerB.id))
          await this.usersUseCase.updateStatusById(match.playerB.id, 'on-line');
        this.notificationGateway.handleSocialUpdateToServer();
        this.gameStates.delete(matchId);
        this.server.socketsLeave(matchId);
      });
      this.gameStateMutexes.delete(matchId);
    });
  }

  @SubscribeMessage('createRoom')
  async createRoom(
    client: Socket,
    {
      matchId,
      aId,
      bId,
      gameMode,
    }: {
      matchId: string;
      aId: string;
      bId: string;
      gameMode: string;
    },
  ) {
    if (client !== this.notificationSocket) return;
    await this.joinMutex.runExclusive(async () => {
      let mutex = this.gameStateMutexes.get(matchId);
      if (mutex) {
        // console.log('! server has match already');
      } else {
        // console.log("! server create new match's mutex");
        this.gameStateMutexes.set(matchId, new Mutex());
        mutex = this.gameStateMutexes.get(matchId);
      }
      await mutex.runExclusive(() => {
        const match = this.gameStates.get(matchId);
        if (match) {
          // console.log('! server has match status already');
        } else {
          // console.log('! server create new match status ' + matchId);
          this.gameStates.set(
            matchId,
            new GameState(matchId, gameMode, aId, bId),
          );
        }
      });
    });
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('joinRoom')
  async joinRoom(
    client: Socket,
    {
      matchId,
      gameMode,
      side,
    }: { matchId: string; gameMode: string; side: string },
  ) {
    // console.log(client.id + ' join room start ' + matchId);
    const user = await this.usersUseCase.findOneByIntraId(
      getIntraIdFromSocket(client),
    );

    await this.joinMutex.runExclusive(async () => {
      /* get game's mutex */
      const mutex = this.gameStateMutexes.get(matchId);
      if (!mutex) {
        // console.log('there is no such match(mutex)');
        client.emit('invalidMatch');
        client.disconnect();
        return;
      }
      /* get game state and join */
      await mutex.runExclusive(() => {
        const match = this.gameStates.get(matchId);
        if (!match) {
          // console.log('there is no such match(state)');
          client.emit('invalidMatch');
          client.disconnect();
          return;
        }
        if (match.gameMode !== gameMode)
          throw new WsException('Invalid Join Game Request');
        if (this.gameService.canJoin(match)) {
          if (!this.gameService.joinMatch(match, client.id, user.id, side)) {
            client.emit('gameFull');
            client.disconnect();
            return;
          }
          client.join(matchId);
          // console.log(client.id + ' join room finish ' + matchId);
        } else {
          client.emit('gameFull');
          client.disconnect();
        }
      });
    });
  }

  @SubscribeMessage('gameReady')
  async startGame(client: Socket) {
    await this.joinMutex.runExclusive(async () => {
      const matchId = this.gameService.getMyMatchIdBySocket(
        this.gameStates,
        client.id,
      );
      if (!matchId)
        throw new WsException('Invalid Request: there is no game(mutex)');
      const mutex = this.gameStateMutexes.get(matchId);
      if (!mutex)
        throw new WsException('Invalid Request: there is no game(state)');
      await mutex.runExclusive(() => {
        const match = this.gameStates.get(matchId);
        if (
          match.playerA.socketId !== client.id &&
          match.playerB.socketId !== client.id
        )
          return;
        this.server.to(matchId).emit('joinedRoom');
        this.server
          .to(matchId)
          .emit('updatePlayers', new GameStateViewModel(match));
        if (
          match.playerA.socketId !== null &&
          match.playerB.socketId !== null
        ) {
          match.isReady = true;
          if (!this.gameStateCrons.has(matchId)) {
            this.gameStateCrons.set(
              matchId,
              this.updateSingleGameStateCron(matchId),
            );
          }
          if (!this.gameTimeCrons.has(matchId)) {
            this.gameTimeCrons.set(
              matchId,
              this.updateSingleGameTimeCron(matchId),
            );
          }
        }
      });
    });
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('keyDown')
  async playerKeyDown(client: Socket, keycode: string) {
    await this.joinMutex.runExclusive(async () => {
      const matchId = this.gameService.getMyMatchIdBySocket(
        this.gameStates,
        client.id,
      );
      if (!matchId)
        throw new WsException('Invalid Request: you are not in game');
      const mutex = this.gameStateMutexes.get(matchId);
      await mutex.runExclusive(() => {
        const match = this.gameStates.get(matchId);
        const targetPlayer = this.gameService.getMe(match, client.id);
        const isA = targetPlayer.color === PLAYER_A_COLOR;
        this.gameService.movePlayer(targetPlayer, isA, keycode);
        this.server
          .to(match.matchId)
          .emit('updatePlayers', new GameStateViewModel(match));
      });
    });
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('keyUp')
  async playerKeyUp(client: Socket) {
    await this.joinMutex.runExclusive(async () => {
      const matchId = this.gameService.getMyMatchIdBySocket(
        this.gameStates,
        client.id,
      );
      if (!matchId)
        throw new WsException('Invalid Request: you are not in game');
      const mutex = this.gameStateMutexes.get(matchId);
      await mutex.runExclusive(() => {
        const match = this.gameStates.get(matchId);
        const targetPlayer = this.gameService.getMe(match, client.id);
        targetPlayer.dx = 0;
        this.server
          .to(match.matchId)
          .emit('updatePlayers', new GameStateViewModel(match));
      });
    });
  }

  updateSingleGameTimeCron(matchId: string): ReturnType<typeof setInterval> {
    // console.log('start update single game time cron' + matchId);
    const intervalId = setInterval(async () => {
      const mutex = this.gameStateMutexes.get(matchId);
      if (!mutex) return;

      await mutex.runExclusive(() => {
        const match: GameState = this.gameStates.get(matchId);
        if (!match || !match.isReady) return; // 아직 게임이 시작되지 않은 상태라면 업데이트하지 않습니다.
        this.gameService.updateTime(match);
        if (match.time >= 0) {
          this.server
            .to(match.matchId)
            .emit('updateTime', new GameStateViewModel(match));
        } else if (
          match.score.playerA === match.score.playerB &&
          match.score.playerA !== SCORE_LIMIT &&
          match.score.playerB !== SCORE_LIMIT
        ) {
          if (this.gameService.setDeuce(match)) {
            this.server
              .to(match.matchId)
              .emit('deuce', new GameStateViewModel(match));
          }
        }
      });
    }, 1000);
    return intervalId;
  }

  updateSingleGameStateCron(matchId: string): ReturnType<typeof setInterval> {
    // console.log('start update game state cron');
    const intervalId = setInterval(async () => {
      const mutex = this.gameStateMutexes.get(matchId);
      if (!mutex) return;

      let skip = false;
      let isGameOver = false;
      let gameWinner;
      let match: GameState = null;

      await mutex.runExclusive(async () => {
        match = this.gameStates.get(matchId);
        if (!match || !match.isReady) {
          skip = true;
          return;
        } // 아직 게임이 시작되지 않은 상태라면 업데이트하지 않습니다.
        if (this.gameService.isGameOver(match)) {
          isGameOver = true;
          return;
        }
        const winnerStr = this.gameService.moveBall(match.ball);
        if (winnerStr === '') {
          this.gameService.handleCollision(
            match.ball,
            match.playerA,
            match.playerB,
          );
        } else {
          if (winnerStr === 'A') match.score.playerA++;
          if (winnerStr === 'B') match.score.playerB++;
          this.server
            .to(match.matchId)
            .emit('updateScore', new GameStateViewModel(match));

          if (this.gameService.isGameOver(match)) {
            isGameOver = true;
            return;
          } else {
            gameWinner = winnerStr === 'A' ? match.playerA : match.playerB;
            this.gameService.resetBall(match.ball);
            const resetId = setTimeout(async () => {
              const mutex = this.gameStateMutexes.get(matchId);
              if (!mutex) return;
              await mutex.runExclusive(() => {
                const match = this.gameStates.get(matchId);
                if (!match) return;
                match.resetTimeout = null;
                this.gameService.readyBall(match.ball, gameWinner);
                this.server
                  .to(match.matchId)
                  .emit('updateBall', new GameStateViewModel(match));
              });
            }, 3000);
            match.resetTimeout = resetId;
          }
        }
        this.server
          .to(match.matchId)
          .emit('updateBall', new GameStateViewModel(match));
      });
      if (skip) return;
      if (isGameOver) {
        await this.joinMutex.runExclusive(async () => {
          /* get game's mutex */
          const mutex = this.gameStateMutexes.get(matchId);
          if (!mutex) return;
          /* get game state and join */
          await mutex.runExclusive(async () => {
            const match = this.gameStates.get(matchId);
            if (!match) return;
            clearInterval(this.gameStateCrons.get(matchId));
            clearInterval(this.gameTimeCrons.get(matchId));
            this.server
              .to(match.matchId)
              .emit('gameOver', new GameStateViewModel(match));
            await this.gameUseCase.saveGame({
              playerAId: match.playerA.id,
              playerBId: match.playerB.id,
              playerAScore: match.score.playerA,
              playerBScore: match.score.playerB,
              isLadder: match.gameMode === GAME_MODE.normal ? false : true,
            });
            await this.achievementUseCase.handleGameAchievement(
              match.playerA.id,
              match.score.playerA > match.score.playerB,
              match.score.playerA,
              match.score.playerB,
            );
            await this.achievementUseCase.handleGameAchievement(
              match.playerB.id,
              match.score.playerB > match.score.playerA,
              match.score.playerB,
              match.score.playerA,
            );
            if (match.resetTimeout !== null) clearTimeout(match.resetTimeout);
            if (this.notificationGateway.getSocketById(match.playerA.id))
              await this.usersUseCase.updateStatusById(
                match.playerA.id,
                'on-line',
              );
            if (this.notificationGateway.getSocketById(match.playerB.id))
              await this.usersUseCase.updateStatusById(
                match.playerB.id,
                'on-line',
              );
            this.notificationGateway.handleSocialUpdateToServer();
            this.gameStates.delete(matchId);
          });
          this.server.socketsLeave(matchId);
          this.gameStateMutexes.delete(matchId);
        });
      }
    }, GAME_STATE_UPDATE_RATE);
    return intervalId;
  }
}
