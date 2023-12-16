import { Module } from '@nestjs/common';
import { NotificationGateway } from './presentation/notification.gateway';
import { NotificationUseCases } from './application/notification.use-case';

@Module({
  providers: [NotificationGateway,
	NotificationUseCases]

})
export class NotificationModule {}
