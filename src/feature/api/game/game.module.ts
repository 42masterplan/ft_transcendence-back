import { UsersModule } from '../users/users.module';
import { GameService } from './application/game.service';
import { GameUseCase } from './application/game.use-case';
import { GameRepository } from './domain/interface/game.repository';
import { PlayerScoreRepository } from './domain/interface/player-score.repository';
import { PlayerTierRepository } from './domain/interface/player-tier.repository';
import { GameEntity } from './infrastructure/game.entity';
import { PlayerScoreEntity } from './infrastructure/player-score.entity';
import { PlayerTierEntity } from './infrastructure/player-tier.entity';
import { GameRepositoryImpl } from './infrastructure/repository/game.repository.impl';
import { PlayerScoreRepositoryImpl } from './infrastructure/repository/player-score.repository.impl';
import { PlayerTierRepositoryImpl } from './infrastructure/repository/player-tier.repository.impl';
import { GameGateway } from './presentation/game.gateway';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      GameEntity,
      PlayerScoreEntity,
      PlayerTierEntity,
    ]),
    UsersModule,
  ],
  providers: [
    GameService,
    GameGateway,

    GameUseCase,

    {
      provide: GameRepository,
      useClass: GameRepositoryImpl,
    },
    {
      provide: PlayerScoreRepository,
      useClass: PlayerScoreRepositoryImpl,
    },
    {
      provide: PlayerTierRepository,
      useClass: PlayerTierRepositoryImpl,
    },
  ], // 게임 관련 서비스와 게이트웨이 등록
})
export class GameModule {}
