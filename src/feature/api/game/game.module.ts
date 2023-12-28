import { GameService } from './game.service';
import { GameGateway } from './presentation/game.gateway';
import { Module } from '@nestjs/common';

@Module({
  providers: [GameService, GameGateway], // 게임 관련 서비스와 게이트웨이 등록
})
export class GameModule {}
