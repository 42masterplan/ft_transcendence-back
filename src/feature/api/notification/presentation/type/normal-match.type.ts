import { GAME_MODE } from '../../../game/presentation/type/game-mode.enum';
import { THEME } from '../../../game/presentation/type/theme.enum';

export type NormalMatch = {
  srcId: string;
  destId: string;
  gameMode: GAME_MODE;
  theme: THEME;
};
