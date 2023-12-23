import { ChannelService } from './application/channel.service';
import { ChannelMessageRepository } from './domain/repositories/channel-message.repository';
import { ChannelParticipantRepository } from './domain/repositories/channel-participant.repository';
import { ChannelUserBannedRepository } from './domain/repositories/channel-user-banned.repository';
import { ChannelRepository } from './domain/repositories/channel.repository';
import { ChannelMessageEntity } from './infrastructure/channel-message.entity';
import { ChannelParticipantEntity } from './infrastructure/channel-participant.entity';
import { ChannelUserBannedEntity } from './infrastructure/channel-user-banned.entity';
import { ChannelEntity } from './infrastructure/channel.entity';
import { ChannelGateway } from './presentation/gateway/channel.gateway';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/feature/api/users/users.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ChannelEntity,
      ChannelParticipantEntity,
      ChannelMessageEntity,
      ChannelUserBannedEntity,
    ]),
    UsersModule,
  ],
  providers: [
    /** gateways */
    ChannelGateway,

    /** use case */
    ChannelService,

    /** repositories */
    ChannelRepository,
    ChannelMessageRepository,
    ChannelParticipantRepository,
    ChannelUserBannedRepository,
  ],
})
export class ChannelModule {}
