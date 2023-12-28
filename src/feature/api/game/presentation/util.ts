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
