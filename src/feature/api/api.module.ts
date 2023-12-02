import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channels/channel.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [UsersModule, AuthModule, ChannelModule],
})
export class ApiModule {}
