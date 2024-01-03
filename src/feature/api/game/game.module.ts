import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GameService } from './application/game.service';
import { GameUseCase } from './application/game.use-case';
import { GameRepository } from './domain/interface/game.repository';
import { PlayerScoreRepository } from './domain/interface/player-score.repository';

import { GameEntity } from './infrastructure/game.entity';
import { PlayerScoreEntity } from './infrastructure/player-score.entity';

import { GameRepositoryImpl } from './infrastructure/repository/game.repository.impl';
import { PlayerScoreRepositoryImpl } from './infrastructure/repository/player-score.repository.impl';

import { GameGateway } from './presentation/game.gateway';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MikroOrmModule.forFeature([GameEntity, PlayerScoreEntity]),
    UsersModule,
    AuthModule,
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
  ],
})
export class GameModule {}
