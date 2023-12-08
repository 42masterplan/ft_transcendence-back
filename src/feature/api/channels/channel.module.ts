import { Channel } from 'diagnostics_channel';
import { ChannelService } from './application/channel.service';
import { ChannelMessageRepository } from './domain/channel-message.repository';
import { ChannelRepository } from './domain/channel.repository';
import { ChannelGateway } from './presentation/gateway/channel.gateway';
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/feature/api/users/users.module';
import { ChannelParticipant } from './domain/channel-participant';
import { ChannelParticipantRepository } from './domain/channel-participant.repository';

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
    ChannelParticipantRepository,
  ],
})
export class ChannelModule {}
