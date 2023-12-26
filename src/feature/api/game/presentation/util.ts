import { Player } from './player';
export const SCREEN_WIDTH = 400;
export const SCREEN_HEIGHT = 600; //screen ratio is 2:3
export const PLAYER_WIDTH = 100;
export const PLAYER_HEIGHT = 15;
export const PLAYER_A_COLOR = 'rgba(217, 217, 217, 1)';
export const PLAYER_B_COLOR = 'rgba(0, 133, 255, 1)';
export const BALL_RADIUS = 5;
export const BALL_COLOR = 'white';
export const BALL_SPEED = 5 / 3;
export const BALL_VELOCITY = { x: 1.1785, y: 1.1785 };
export const PADDLE_OFFSET = SCREEN_WIDTH / 100;
export const SCORE_LIMIT = 10;
export const GAME_TIME_LIMIT = 180;
export const DEBOUNCING_TIME = 500;
export const RENDERING_RATE = 5;

export type score = {
  playerA: number;
  playerB: number;
};

export type ball = {
  x: number;
  y: number;
  radius: number;
  velocity: { x: number; y: number };
  color: string;
  lastCollision: number;
};

export type state = {
  matchId: string;
  playerA: Player;
  playerB: Player;
  ball: ball;
  score: score;
  time: number;
  isReady: boolean;
  isForfeit: boolean;
  isDeuce: boolean;
};

function createNewGameState(matchId: string) {
  return {
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

function resetBall(isA: boolean, state: state, io: any) {
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

function updateGameState(state: state, io: any) {
  state.ball.x += state.ball.velocity.x;
  state.ball.y += state.ball.velocity.y;

  if (
    state.ball.x - state.ball.radius <= 1 ||
    state.ball.x + state.ball.radius >= SCREEN_WIDTH - 1
  )
    state.ball.velocity.x *= -1;
  else if (state.ball.y < 0) resetBall(true, state, io);
  else if (state.ball.y > SCREEN_HEIGHT) resetBall(false, state, io);
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
