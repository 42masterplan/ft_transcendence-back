import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GameWithPlayerUseCase } from './application/game-with-player.use-case';
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
import { Module, forwardRef } from '@nestjs/common';

@Module({
  imports: [
    MikroOrmModule.forFeature([GameEntity, PlayerScoreEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  providers: [
    GameService,
    GameGateway,

    GameUseCase,
    GameWithPlayerUseCase,

    {
      provide: GameRepository,
      useClass: GameRepositoryImpl,
    },
    {
      provide: PlayerScoreRepository,
      useClass: PlayerScoreRepositoryImpl,
    },
  ],
  exports: [GameWithPlayerUseCase],
})
export class GameModule {}
