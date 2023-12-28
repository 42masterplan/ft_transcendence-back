import { Player } from './presentation/type/player';
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_A_COLOR,
  PLAYER_B_COLOR,
  BALL_RADIUS,
  BALL_COLOR,
  BALL_VELOCITY,
  GAME_TIME_LIMIT,
  BALL_SPEED,
  DEBOUNCING_TIME,
  SCORE_LIMIT,
  state,
} from './presentation/util';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  private gameStates: { [key: string]: state } = {};

  // 여기에 게임 로직 메소드 구현
  createNewGameState(matchId: string) {
    this.gameStates[matchId] = {
      matchId: matchId,
      playerA: new Player({
        id: null,
        x: SCREEN_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: SCREEN_HEIGHT - 45,
        color: PLAYER_A_COLOR,
      }),
      playerB: new Player({
        id: null,
        x: SCREEN_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: 30,
        color: PLAYER_B_COLOR,
      }),
      ball: {
        x: SCREEN_WIDTH / 2,
        y: SCREEN_HEIGHT / 2,
        velocity: BALL_VELOCITY,
        radius: BALL_RADIUS,
        color: BALL_COLOR,
        lastCollision: 0,
      },
      score: {
        playerA: 0,
        playerB: 0,
      },
      time: GAME_TIME_LIMIT,
      isReady: false,
      isForfeit: false,
      isDeuce: false,
    };
  }

  updateGameState(state: state) {
    state.ball.x += state.ball.velocity.x;
    state.ball.y += state.ball.velocity.y;
    if (
      state.ball.x - state.ball.radius <= 1 ||
      state.ball.x + state.ball.radius >= SCREEN_WIDTH - 1
    )
      state.ball.velocity.x *= -1;
    else if (state.ball.y < 0) this.resetBall(true, state, io);
    else if (state.ball.y > SCREEN_HEIGHT) this.resetBall(false, state, io);
    if (
      state.playerA.isCollided(state.ball) ||
      state.playerB.isCollided(state.ball)
    ) {
      const now = Date.now();
      if (
        state.ball.lastCollision &&
        now - state.ball.lastCollision < DEBOUNCING_TIME
      )
        return;
      if (state.playerA.isCollided(state.ball))
        state.playerA.handleCollision(state.ball, now);
      else if (state.playerB.isCollided(state.ball))
        state.playerB.handleCollision(state.ball, now);
    }
  }

  resetBall(isA: boolean, state: state) {
    if (isA) state.score.playerA++;
    else state.score.playerB++;
    io.to(state.matchId).emit('updateScore', state);
    if (
      (!state.isDeuce && state.score.playerA === SCORE_LIMIT) ||
      state.score.playerB === SCORE_LIMIT
    ) {
      io.to(state.matchId).emit('gameOver', state);
      io.socketsLeave(state.matchId);
      return;
    } else if (
      state.isDeuce &&
      Math.abs(state.score.playerA - state.score.playerB) >= 2
    ) {
      io.to(state.matchId).emit('gameOver', state);
      io.socketsLeave(state.matchId);
      return;
    }
    state.ball.x = SCREEN_WIDTH / 2;
    state.ball.y = SCREEN_HEIGHT / 2;
    state.ball.velocity = { x: 0, y: 0 };
    setTimeout(() => {
      const x = !isA
        ? state.playerA.x + PLAYER_WIDTH / 2
        : state.playerB.x + PLAYER_WIDTH / 2;
      const y = !isA ? state.playerA.y : state.playerB.y;
      const dx = x - state.ball.x;
      const dy = y - state.ball.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      const ret_x = (dx / speed) * BALL_SPEED;
      const ret_y = (dy / speed) * BALL_SPEED;
      state.ball.velocity = { x: ret_x, y: ret_y };
      io.to(state.matchId).emit('updateBall', state);
    }, 3000);
  }
}
