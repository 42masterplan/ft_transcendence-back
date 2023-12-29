const GAME_THEME = {
  default: 'default',
  badminton: 'badminton',
  basketball: 'basketball',
  soccer: 'soccer',
  swimming: 'swimming',
} as const;
type GAME_THEME = (typeof GAME_THEME)[keyof typeof GAME_THEME];
