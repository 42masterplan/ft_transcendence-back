import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channels/channel.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, AuthModule, ChannelModule],
})
export class ApiModule {}
