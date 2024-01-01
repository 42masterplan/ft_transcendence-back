import { UsersModule } from '../users/users.module';
import { DmUseCase } from './application/dm.use-case';
import { LadderQueueService } from './application/ladder-queue.service';
import { DmMessageRepository } from './domain/repositories/dm-message.repository';
import { DmRepository } from './domain/repositories/dm.repository';
import { DmMessageEntity } from './infrastructure/dm-message.entity';
import { DmEntity } from './infrastructure/dm.entity';
import { NotificationGateway } from './presentation/notification.gateway';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MikroOrmModule.forFeature([DmEntity, DmMessageEntity]),
  ],
  providers: [
    NotificationGateway,
    LadderQueueService,
    DmUseCase,
    DmRepository,
    DmMessageRepository,
  ],
  exports: [DmUseCase],
})
export class NotificationModule {}
