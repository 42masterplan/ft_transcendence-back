import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChannelModule } from './feat/channel/channel.module';
import { UsersModule } from './feat/users/users.module';

@Module({
  imports: [ChannelModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
