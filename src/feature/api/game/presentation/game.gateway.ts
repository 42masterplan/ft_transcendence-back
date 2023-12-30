import { getUserFromSocket } from '../../auth/tools/socketTools';
import { UsersService } from '../../users/users.service';
import { GameService } from '../application/game.service';
import { GameUseCase } from '../application/game.use-case';
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
} from '@nestjs/websockets';
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
  private gameStates: GameState[] = [];

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
    const match = this.gameService.getMatch(this.gameStates, client.id);
    if (!match) return;
    if (!match.isReady) {
      // 1명이 들어왔는데 두 번째 플레이어가 들어오기 전에 연결이 끊긴 경우 게임 상태를 삭제합니다.
      // TODO: 로직 확인
      this.gameService.deleteMatch(this.gameStates, match);
      return;
    }
    this.gameService.matchForfeit(match, client.id);
    this.server
      .to(match.matchId)
      .emit('updateScore', new GameStateViewModel(match));
    this.server
      .to(match.matchId)
      .emit('gameOver', new GameStateViewModel(match));
    // await this.gameUseCase.saveGame({
    //   playerAId: match.playerA.id,
    //   playerBId: match.playerB.id,
    //   playerAScore: match.score.playerA,
    //   playerBScore: match.score.playerB,
    //   isLadder: match.gameMode === GAME_MODE.normal ? false : true,
    // });
    this.gameService.deleteMatch(this.gameStates, match);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    client: Socket,
    { matchId, gameMode }: { matchId: string; gameMode: string },
  ) {
    console.log('join room' + gameMode);
    const match = this.gameService.findOneByMatchId(
      this.gameStates,
      matchId,
      gameMode,
    );
    console.log(match);
    const user = await getUserFromSocket(client, this.usersService);
    if (this.gameService.canJoin(match)) {
      this.gameService.joinMatch(match, client.id, user.id);
      client.join(matchId);
      client.emit('joinedRoom');
    } else {
      client.emit('gameFull');
      client.disconnect();
    }
  }

  @SubscribeMessage('keyDown')
  playerKeyDown(client: Socket, keycode: string) {
    const match = this.gameService.getMatch(this.gameStates, client.id);
    const targetPlayer = this.gameService.getMe(match, client.id);
    if (targetPlayer.id === '') return;
    const isA = targetPlayer.color === PLAYER_A_COLOR;
    this.gameService.movePlayer(targetPlayer, isA, keycode);
  }

  @SubscribeMessage('keyUp')
  playerKeyUp(client: Socket) {
    const match = this.gameService.getMatch(this.gameStates, client.id);
    const targetPlayer = this.gameService.getMe(match, client.id);
    if (targetPlayer.id === '') return;
    targetPlayer.dx = 0;
  }

  private async updateGameState(state: GameState) {
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
        this.server
          .to(state.matchId)
          .emit('gameOver', new GameStateViewModel(state));
        await this.gameUseCase.saveGame({
          playerAId: state.playerA.id,
          playerBId: state.playerB.id,
          playerAScore: state.score.playerA,
          playerBScore: state.score.playerB,
          isLadder: state.gameMode === 'normal' ? false : true,
        });
        this.gameService.deleteMatch(this.gameStates, state);
        this.server.socketsLeave(state.matchId);
      } else {
        this.gameService.resetBall(state.ball);
        setTimeout(() => {
          this.gameService.readyBall(state.ball, winner);
          this.server
            .to(state.matchId)
            .emit('updateBall', new GameStateViewModel(state));
        }, 3000);
      }
    }
    this.gameService.handleCollision(state.ball, state.playerA, state.playerB);
  }

  updateGameStateCron() {
    console.log('start update game state cron');
    setInterval(() => {
      this.gameStates.forEach((state: GameState) => {
        if (!state.isReady) return; // 아직 게임이 시작되지 않은 상태라면 업데이트하지 않습니다.
        this.updateGameState(state);
        this.server
          .to(state.matchId)
          .emit('updatePlayers', new GameStateViewModel(state)); // 플레이어의 위치를 업데이트합니다.
        this.server
          .to(state.matchId)
          .emit('updateBall', new GameStateViewModel(state));
      });
    }, GAME_STATE_UPDATE_RATE);
  }

  updateGameTimeCron() {
    console.log('start update game time cron');
    const timerId = setInterval(() => {
      this.gameStates.forEach((state: GameState) => {
        if (!state.isReady) return;
        if (this.gameService.updateTimeAndCheckFinish(state)) {
          if (state.score.playerA > state.score.playerB)
            this.server
              .to(state.matchId)
              .emit('gameOver', new GameStateViewModel(state));
          else if (state.score.playerA < state.score.playerB)
            this.server
              .to(state.matchId)
              .emit('gameOver', new GameStateViewModel(state));
          else {
            this.gameService.setDeuce(state);
            this.server
              .to(state.matchId)
              .emit('deuce', new GameStateViewModel(state));
            clearInterval(timerId);
            return;
          }
          clearInterval(timerId);
          this.server.socketsLeave(state.matchId);
          return;
        }

        this.server
          .to(state.matchId)
          .emit('updateTime', new GameStateViewModel(state));
      });
    }, 1000);
  }
}
