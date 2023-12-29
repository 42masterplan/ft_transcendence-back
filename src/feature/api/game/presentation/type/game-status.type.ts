const GAME_STATUS = {
  win: 'win',
  lose: 'lose',
  draw: 'draw',
} as const;
type GAME_STATUS = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];
