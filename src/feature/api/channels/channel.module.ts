import { Channel } from 'diagnostics_channel';
import { ChannelService } from './application/channel.service';
import { ChannelMessageRepository } from './domain/channel-message.repository';
import { ChannelRepository } from './domain/channel.repository';
import { ChannelGateway } from './presentation/gateway/channel.gateway';
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/feature/api/users/users.module';
import { ChannelParticipant } from './domain/channel-participant';
import { ChannelParticipantRepository } from './domain/channel-participant.repository';
import { ChannelUserBannedRepository } from './domain/channel-user-banned.repository';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ChannelEntity } from './infrastructure/channel.entity';
import { ChannelMessageEntity } from './infrastructure/channel-message.entity';
import { ChannelParticipantEntity } from './infrastructure/channel-participant.entity';
import { ChannelUserBannedEntity } from './infrastructure/channel-user-banned.entity';

@Module({
  imports: [MikroOrmModule.forFeature([ChannelEntity, ChannelParticipantEntity, ChannelMessageEntity, ChannelUserBannedEntity])
  , UsersModule],
  providers: [
    /** gateways */
    ChannelGateway,

    /** use case */
    ChannelService,

    /** repositories */
    ChannelRepository,
    ChannelMessageRepository,
    ChannelParticipantRepository,
    ChannelUserBannedRepository
  ],
})
export class ChannelModule {}
