import { UsersModule } from '../users/users.module';
import { NotificationUseCases } from './application/notification.use-case';
import { NotificationGateway } from './presentation/notification.gateway';
import { Module } from '@nestjs/common';

@Module({
  imports: [UsersModule],
  providers: [NotificationGateway, NotificationUseCases],
})
export class NotificationModule {}
