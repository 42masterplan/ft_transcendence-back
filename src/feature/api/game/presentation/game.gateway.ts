import { getUserFromSocket } from '../../auth/tools/socketTools';
import { UsersService } from '../../users/users.service';
import { GameService } from '../application/game.service';
import { GameUseCase } from '../application/game.use-case';
import { GAME_MODE } from './type/game-mode.type';
import { GameState } from './type/game-state';
import { GAME_STATE_UPDATE_RATE, PLAYER_A_COLOR } from './util';
import { GameStateViewModel } from './view-model/game-state.vm';
import { UsePipes } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Mutex } from 'async-mutex';
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
  private gameStatesOld: GameState[] = [];
  private gameStateMutexes: Map<string, Mutex> = new Map();
  private gameStates: Map<string, GameState> = new Map();
  private joinMutex = new Mutex();

  @WebSocketServer()
  server;
  constructor(
    private readonly gameService: GameService,
    private readonly usersService: UsersService,
    private readonly gameUseCase: GameUseCase,
  ) {
    this.updateGameStateCron();
    this.updateGameTimeCron();
  }

  //TODO: match, state 혼용한거 합치기

  handleConnection(client: any, ...args: any[]) {
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
        }
        this.gameStates.delete(matchId);
      });
      this.gameStateMutexes.delete(matchId);
    });

    // const match = this.gameService.getMatchOld(this.gameStatesOld, client.id);
    // if (!match) return;
    // if (!match.isReady) {
    //   // 1명이 들어왔는데 두 번째 플레이어가 들어오기 전에 연결이 끊긴 경우 게임 상태를 삭제합니다.
    //   // TODO: 로직 확인
    //   this.gameService.deleteMatch(this.gameStatesOld, match);
    //   return;
    // }
    // this.gameService.matchForfeit(match, client.id);
    // this.server
    //   .to(match.matchId)
    //   .emit('updateScore', new GameStateViewModel(match));
    // this.server
    //   .to(match.matchId)
    //   .emit('gameOver', new GameStateViewModel(match));
    // await this.gameUseCase.saveGame({
    //   playerAId: match.playerA.id,
    //   playerBId: match.playerB.id,
    //   playerAScore: match.score.playerA,
    //   playerBScore: match.score.playerB,
    //   isLadder: match.gameMode === GAME_MODE.normal ? false : true,
    // });
    // this.gameService.deleteMatch(this.gameStatesOld, match);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    client: Socket,
    { matchId, gameMode }: { matchId: string; gameMode: string },
  ) {
    console.log('join room ' + gameMode);
    const user = await getUserFromSocket(client, this.usersService);

    await this.joinMutex.runExclusive(async () => {
      /* get game's mutex */
      let mutex = this.gameStateMutexes.get(matchId);
      if (!mutex) {
        console.log("create new match's mutex");
        this.gameStateMutexes.set(matchId, new Mutex());
        mutex = this.gameStateMutexes.get(matchId);
      }
      /* get game state and join */
      await mutex.runExclusive(() => {
        let match = this.gameStates.get(matchId);
        if (!match) {
          console.log('create new match');
          this.gameStates.set(matchId, new GameState(matchId, gameMode));
          match = this.gameStates.get(matchId);
        }
        if (match.gameMode !== gameMode)
          throw new WsException('Invalid Join Game Request');
        if (this.gameService.canJoin(match)) {
          this.gameService.joinMatch(match, client.id, user.id);
          client.join(matchId);
          client.emit('joinedRoom');
        } else {
          client.emit('gameFull');
          client.disconnect();
        }
      });
    });
  }

  @SubscribeMessage('keyDown')
  async playerKeyDown(client: Socket, keycode: string) {
    await this.joinMutex.runExclusive(async () => {
      const matchId = this.gameService.getMyMatchId(this.gameStates, client.id);
      if (!matchId)
        throw new WsException('Invalid Request: you are not in game');
      const mutex = this.gameStateMutexes.get(matchId);
      await mutex.runExclusive(() => {
        const state = this.gameStates.get(matchId);
        const targetPlayer = this.gameService.getMe(state, client.id);
        const isA = targetPlayer.color === PLAYER_A_COLOR;
        this.gameService.movePlayer(targetPlayer, isA, keycode);
        this.server
          .to(state.matchId)
          .emit('updatePlayers', new GameStateViewModel(state));
      });
    });
  }

  @SubscribeMessage('keyUp')
  async playerKeyUp(client: Socket) {
    await this.joinMutex.runExclusive(async () => {
      const matchId = this.gameService.getMyMatchId(this.gameStates, client.id);
      if (!matchId)
        throw new WsException('Invalid Request: you are not in game');
      const mutex = this.gameStateMutexes.get(matchId);
      await mutex.runExclusive(() => {
        const state = this.gameStates.get(matchId);
        const targetPlayer = this.gameService.getMe(state, client.id);
        targetPlayer.dx = 0;
        this.server
          .to(state.matchId)
          .emit('updatePlayers', new GameStateViewModel(state));
      });
    });
  }
  private updateGameState(state: GameState): boolean {
    // 현재 속도에 따라 공의 위치를 업데이트합니다.
    const winnerStr = this.gameService.moveBall(state.ball);
    if (winnerStr !== '') {
      if (winnerStr === 'A') state.score.playerA++;
      if (winnerStr === 'B') state.score.playerB++;
      this.server
        .to(state.matchId)
        .emit('updateScore', new GameStateViewModel(state));

      const winner = winnerStr === 'A' ? state.playerA : state.playerB;
      if (this.gameService.isGameOver(state)) {
        return false;
      } else {
        this.gameService.resetBall(state.ball);
        setTimeout(() => {
          this.gameService.readyBall(state.ball, winner);
        }, 3000);
      }
    } else {
      this.gameService.handleCollision(
        state.ball,
        state.playerA,
        state.playerB,
      );
    }
    return true;
  }

  private updateGameStateOld(state: GameState): boolean {
    // 현재 속도에 따라 공의 위치를 업데이트합니다.
    const winnerStr = this.gameService.moveBall(state.ball);
    if (winnerStr !== '') {
      if (winnerStr === 'A') state.score.playerA++;
      if (winnerStr === 'B') state.score.playerB++;
      this.server
        .to(state.matchId)
        .emit('updateScore', new GameStateViewModel(state));

      const winner = winnerStr === 'A' ? state.playerA : state.playerB;
      if (this.gameService.isGameOver(state)) {
        return false;
      } else {
        this.gameService.resetBall(state.ball);
        setTimeout(() => {
          this.gameService.readyBall(state.ball, winner);
        }, 3000);
      }
    } else {
      this.gameService.handleCollision(
        state.ball,
        state.playerA,
        state.playerB,
      );
    }
    return true;
  }

  updateGameStateCron() {
    console.log('start update game state cron');
    setInterval(async () => {
      for (const [matchId, mutex] of this.gameStateMutexes) {
        let isGameOver = false;
        let isGameReset = false;
        let gameWinner;
        await mutex.runExclusive(async () => {
          const state: GameState = this.gameStates.get(matchId);
          if (!state || !state.isReady) return; // 아직 게임이 시작되지 않은 상태라면 업데이트하지 않습니다.
          const winnerStr = this.gameService.moveBall(state.ball);
          if (winnerStr === '')
            this.gameService.handleCollision(
              state.ball,
              state.playerA,
              state.playerB,
            );
          else {
            if (winnerStr === 'A') state.score.playerA++;
            if (winnerStr === 'B') state.score.playerB++;
            this.server
              .to(state.matchId)
              .emit('updateScore', new GameStateViewModel(state));

            if (this.gameService.isGameOver(state)) {
              isGameOver = true;
              this.server
                .to(state.matchId)
                .emit('gameOver', new GameStateViewModel(state));
              await this.gameUseCase.saveGame({
                playerAId: state.playerA.id,
                playerBId: state.playerB.id,
                playerAScore: state.score.playerA,
                playerBScore: state.score.playerB,
                isLadder: state.gameMode === GAME_MODE.normal ? false : true,
              });
              return;
            } else {
              isGameReset = true;
              gameWinner = winnerStr === 'A' ? state.playerA : state.playerB;
              this.gameService.resetBall(state.ball);
            }
          }
          this.server
            .to(state.matchId)
            .emit('updateBall', new GameStateViewModel(state));
        });
        if (isGameOver) {
          await this.joinMutex.runExclusive(async () => {
            /* get game's mutex */
            const mutex = this.gameStateMutexes.get(matchId);
            if (!mutex) return;
            /* get game state and join */
            await mutex.runExclusive(() => {
              const match = this.gameStates.get(matchId);
              if (!match) return;
              this.gameStates.delete(matchId);
            });
            this.gameStateMutexes.delete(matchId);
            this.server.socketsLeave(matchId);
          });
        }
        if (isGameReset) {
          setTimeout(async () => {
            const mutex = this.gameStateMutexes.get(matchId);
            if (!mutex) throw new WsException('Cannot get game mutex');
            await mutex.runExclusive(() => {
              const match = this.gameStates.get(matchId);
              if (!match) throw new WsException('Cannot get game state');
              this.gameService.readyBall(match.ball, gameWinner);
              this.server
                .to(match.matchId)
                .emit('updateBall', new GameStateViewModel(match));
            });
          }, 3000);
        }
      }
    }, GAME_STATE_UPDATE_RATE);
  }

  updateGameStateCronOld() {
    console.log('start update game state cron');
    setInterval(async () => {
      for (const [matchId, mutex] of this.gameStateMutexes) {
        await mutex.runExclusive(async () => {
          const state: GameState = this.gameStates.get(matchId);
          if (!state || !state.isReady) return; // 아직 게임이 시작되지 않은 상태라면 업데이트하지 않습니다.

          if (this.updateGameStateOld(state)) {
            this.server
              .to(state.matchId)
              .emit('updateBall', new GameStateViewModel(state));
          } else {
            this.server
              .to(state.matchId)
              .emit('gameOver', new GameStateViewModel(state));
            await this.gameUseCase.saveGame({
              playerAId: state.playerA.id,
              playerBId: state.playerB.id,
              playerAScore: state.score.playerA,
              playerBScore: state.score.playerB,
              isLadder: state.gameMode === GAME_MODE.normal ? false : true,
            });

            this.gameService.deleteMatch(this.gameStatesOld, state);
            this.server.socketsLeave(state.matchId);
          }
        });
      }
    }, GAME_STATE_UPDATE_RATE);
  }

  updateGameTimeCron() {
    console.log('start update game time cron');
    const timerId = setInterval(async () => {
      for (const [matchId, mutex] of this.gameStateMutexes) {
        let isGameOver = false;

        await mutex.runExclusive(() => {
          const state: GameState = this.gameStates.get(matchId);
          if (!state || !state.isReady) return; // 아직 게임이 시작되지 않은 상태라면 업데이트하지 않습니다.
          if (this.gameService.updateTimeAndCheckFinish(state)) {
            if (state.score.playerA !== state.score.playerB) {
              isGameOver = true;
              this.server
                .to(state.matchId)
                .emit('gameOver', new GameStateViewModel(state));
            } else {
              this.gameService.setDeuce(state);
              this.server
                .to(state.matchId)
                .emit('deuce', new GameStateViewModel(state));
            }
            clearInterval(timerId);
          } else {
            this.server
              .to(state.matchId)
              .emit('updateTime', new GameStateViewModel(state));
          }
        });
        if (isGameOver) {
          await this.joinMutex.runExclusive(async () => {
            /* get game's mutex */
            const mutex = this.gameStateMutexes.get(matchId);
            if (!mutex) return;
            /* get game state and join */
            await mutex.runExclusive(() => {
              const match = this.gameStates.get(matchId);
              if (!match) return;
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
