import { UsersModule } from '../users/users.module';
import { DmUsecase } from './application/dm.use-case';
import { DmMessageRepository } from './domain/repositories/dm-message.repository';
import { DmRepository } from './domain/repositories/dm.repository';
import { DmMessageEntity } from './infrastructure/dm-message.entity';
import { DmEntity } from './infrastructure/dm.entity';
import { NotificationGateway } from './presentation/notification.gateway';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    UsersModule,
    MikroOrmModule.forFeature([DmEntity, DmMessageEntity]),
  ],
  providers: [
    NotificationGateway,
    DmUsecase,
    DmRepository,
    DmMessageRepository,
  ],
})
export class NotificationModule {}
