import { GameService } from '../game.service';
import { Controller, Get } from '@nestjs/common';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  getGameStatus(): string {
    // 게임 상태 반환 로직
    return 'Game status...';
  }
}
