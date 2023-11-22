import { Module } from '@nestjs/common';
import { UsersModule } from 'src/feature/api/users/users.module';
import { ChannelService } from './application/channel.service';
import { ChannelRepository } from './domain/channel.repository';
import { ChannelMessageRepository } from './presentation/gateway/channel-message.repository';
import { ChannelGateway } from './presentation/gateway/channel.gateway';

@Module({
  imports: [UsersModule],
  providers: [
    /** gateways */
    ChannelGateway,

    /** use case */
    ChannelService,

    /** repositories */
    ChannelRepository,
    ChannelMessageRepository,
  ],
})
export class ChannelModule {}
