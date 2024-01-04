import { AuthService } from '../../auth/auth.service';
import { JwtSocketGuard } from '../../auth/jwt/jwt-socket.guard';
import { getIntraIdFromSocket } from '../../auth/tools/socketTools';
import { AchievementUseCase } from '../../users/application/use-case/achievement.use-case';
import { UsersUseCase } from '../../users/application/use-case/users.use-case';
import { UsersService } from '../../users/users.service';
import { GameService } from '../application/game.service';
import { GameUseCase } from '../application/game.use-case';
import { GAME_MODE } from './type/game-mode.enum';
import { GameState } from './type/game-state';
import { GAME_STATE_UPDATE_RATE, PLAYER_A_COLOR } from './util';
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
      console.log(new WsException(errors));
      return new WsException(errors);
    },
  }),
)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private gameStateMutexes: Map<string, Mutex> = new Map();
  private gameStates: Map<string, GameState> = new Map();
  private joinMutex = new Mutex();
  private notificationSocket: Socket;

  @WebSocketServer()
  private readonly server: Server;
  constructor(
    private readonly authService: AuthService,
    private readonly gameService: GameService,
    private readonly usersService: UsersService,
    private readonly gameUseCase: GameUseCase,
    private readonly userUseCase: UsersUseCase,
    private readonly achievementUseCase: AchievementUseCase,
  ) {
    this.updateGameStateCron();
    this.updateGameTimeCron();
  }

  async handleConnection(client: any, ...args: any[]) {
    if (
      client.handshake.headers.server_secret_key ===
      process.env.SERVER_SECRET_KEY
    ) {
      console.log('Hi, you are server!');
      this.notificationSocket = client;
    } else {
      const token = client.handshake.auth?.Authorization?.split(' ')[1];
      const user = await this.authService.verifySocket(token);
      if (!user) {
        client.disconnect();
        return;
      }
      await this.userUseCase.updateStatus(user.intraId, 'in-game');
    }
    console.log('Game is get connected!');
  }

  async handleDisconnect(client: any) {
    console.log('Game is get disconnected!');
    await this.joinMutex.runExclusive(async () => {
      const matchId = this.gameService.getMyMatchId(this.gameStates, client.id);
      if (!matchId) return;
      const mutex = this.gameStateMutexes.get(matchId);
      if (!mutex) return;

      await mutex.runExclusive(async () => {
        const match = this.gameStates.get(matchId);
        if (!match) return;
        if (match.isReady) {
          this.gameService.matchForfeit(match, client.id);
          this.server
            .to(match.matchId)
            .emit('updateScore', new GameStateViewModel(match));
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
            1,
            1,
          );
          await this.achievementUseCase.handleGameAchievement(
            match.playerB.id,
            match.score.playerB > match.score.playerA,
            1,
            1,
          );
        }
        if (match.resetTimeout !== null) clearTimeout(match.resetTimeout);
        this.gameStates.delete(matchId);
      });
      this.gameStateMutexes.delete(matchId);
    });
    const token = client.handshake.auth?.Authorization?.split(' ')[1];
    const user = await this.authService.verifySocket(token);
    if (!user) return;
    await this.userUseCase.updateStatus(user.intraId, 'on-line');
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
        console.log('! server has match already');
      } else {
        console.log("! server create new match's mutex");
        this.gameStateMutexes.set(matchId, new Mutex());
        mutex = this.gameStateMutexes.get(matchId);
      }
      await mutex.runExclusive(() => {
        const match = this.gameStates.get(matchId);
        if (match) {
          console.log('! server has match status already');
        } else {
          console.log('! server create new match status ' + matchId);
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
    console.log(client.id + ' join room start ' + matchId);
    const user = await this.usersService.findOneByIntraId(
      getIntraIdFromSocket(client),
    );

    await this.joinMutex.runExclusive(async () => {
      /* get game's mutex */
      const mutex = this.gameStateMutexes.get(matchId);
      if (!mutex) {
        console.log('there is no such match(mutex)');
        return;
      }
      /* get game state and join */
      await mutex.runExclusive(() => {
        const match = this.gameStates.get(matchId);
        if (!match) {
          console.log('there is no such match(state)');
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
          console.log(client.id + ' join room finish ' + matchId);
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
      const matchId = this.gameService.getMyMatchId(this.gameStates, client.id);
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
        if (match.playerA.socketId !== null && match.playerB.socketId !== null)
          match.isReady = true;
      });
    });
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('keyDown')
  async playerKeyDown(client: Socket, keycode: string) {
    await this.joinMutex.runExclusive(async () => {
      const matchId = this.gameService.getMyMatchId(this.gameStates, client.id);
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
      const matchId = this.gameService.getMyMatchId(this.gameStates, client.id);
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

  updateGameStateCron() {
    console.log('start update game state cron');
    setInterval(async () => {
      for (const [matchId, mutex] of this.gameStateMutexes) {
        let skip = false;
        let isGameOver = false;
        let isGameReset = false;
        let gameWinner;
        await mutex.runExclusive(async () => {
          const match: GameState = this.gameStates.get(matchId);
          if (!match || !match.isReady) {
            skip = true;
            return;
          } // 아직 게임이 시작되지 않은 상태라면 업데이트하지 않습니다.
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
              return;
            } else {
              isGameReset = true;
              gameWinner = winnerStr === 'A' ? match.playerA : match.playerB;
              this.gameService.resetBall(match.ball);
            }
          }
          this.server
            .to(match.matchId)
            .emit('updateBall', new GameStateViewModel(match));
        });
        if (!skip && isGameOver) {
          await this.joinMutex.runExclusive(async () => {
            /* get game's mutex */
            const mutex = this.gameStateMutexes.get(matchId);
            if (!mutex) return;
            /* get game state and join */
            await mutex.runExclusive(() => {
              const match = this.gameStates.get(matchId);
              if (!match) return;
              if (match.resetTimeout !== null) clearTimeout(match.resetTimeout);
              this.gameStates.delete(matchId);
            });
            this.gameStateMutexes.delete(matchId);
            this.server.socketsLeave(matchId);
          });
          return;
        }
        if (!skip && isGameReset) {
          const resetId = setTimeout(async () => {
            const mutex = this.gameStateMutexes.get(matchId);
            if (!mutex) throw new WsException('Cannot get game mutex');
            await mutex.runExclusive(() => {
              const match = this.gameStates.get(matchId);
              if (!match) throw new WsException('Cannot get game state');
              match.resetTimeout = null;
              this.gameService.readyBall(match.ball, gameWinner);
              this.server
                .to(match.matchId)
                .emit('updateBall', new GameStateViewModel(match));
            });
          }, 3000);
          const mutex = this.gameStateMutexes.get(matchId);
          if (!mutex) throw new WsException('Cannot get game mutex');
          await mutex.runExclusive(() => {
            const match = this.gameStates.get(matchId);
            if (!match) throw new WsException('Cannot get game state');
            match.resetTimeout = resetId;
          });
        }
      }
    }, GAME_STATE_UPDATE_RATE);
  }

  updateGameTimeCron() {
    console.log('start update game time cron');
    const timerId = setInterval(async () => {
      for (const [matchId, mutex] of this.gameStateMutexes) {
        let isGameOver = false;

        await mutex.runExclusive(() => {
          const match: GameState = this.gameStates.get(matchId);
          if (!match || !match.isReady) return; // 아직 게임이 시작되지 않은 상태라면 업데이트하지 않습니다.
          if (this.gameService.updateTimeAndCheckFinish(match)) {
            if (match.score.playerA !== match.score.playerB) {
              isGameOver = true;
              this.server
                .to(match.matchId)
                .emit('gameOver', new GameStateViewModel(match));
            } else {
              this.gameService.setDeuce(match);
              this.server
                .to(match.matchId)
                .emit('deuce', new GameStateViewModel(match));
            }
            clearInterval(timerId);
          } else {
            this.server
              .to(match.matchId)
              .emit('updateTime', new GameStateViewModel(match));
          }
        });
        if (isGameOver) {
          await this.joinMutex.runExclusive(async () => {
            /* get game's mutex */
            const mutex = this.gameStateMutexes.get(matchId);
            if (!mutex) return;
            /* get game match and join */
            await mutex.runExclusive(() => {
              const match = this.gameStates.get(matchId);
              if (!match) return;
              if (match.resetTimeout !== null) clearTimeout(match.resetTimeout);
              this.gameStates.delete(matchId);
            });
            this.gameStateMutexes.delete(matchId);
            this.server.socketsLeave(matchId);
          });
        }
      }
    }, 1000);
  }
}
