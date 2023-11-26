import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChannelModule } from './channels/channel.module';

@Module({
  imports: [UsersModule, AuthModule, ChannelModule],
})
export class ApiModule {}
