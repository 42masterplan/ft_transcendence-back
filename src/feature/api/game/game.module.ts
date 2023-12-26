import { GameService } from './game.service';
import { GameController } from './presentation/game.controller';
import { GameGateway } from './presentation/game.gateway';
import { Module } from '@nestjs/common';

@Module({
  controllers: [GameController], // 게임 관련 컨트롤러 등록
  providers: [GameService, GameGateway], // 게임 관련 서비스와 게이트웨이 등록
})
export class GameModule {}
