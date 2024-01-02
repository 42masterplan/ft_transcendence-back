import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channels/channel.module';
import { GameModule } from './game/game.module';
import { MailModule } from './mail/mail.module';
import { NotificationModule } from './notification/notification.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ChannelModule,
    MailModule,
    NotificationModule,
    GameModule,
  ],
})
export class ApiModule {}
