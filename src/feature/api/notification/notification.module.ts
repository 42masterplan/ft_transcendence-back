import { UsersModule } from '../users/users.module';
import { NotificationUseCases } from './application/notification.use-case';
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
  providers: [NotificationGateway, NotificationUseCases],
})
export class NotificationModule {}
