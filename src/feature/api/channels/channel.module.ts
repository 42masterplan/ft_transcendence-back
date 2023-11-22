import { Module } from '@nestjs/common';
import { ChannelGateway } from './presentation/gateway/channel.gateway';
import { ChannelService } from './application/channel.service';
import { ChannelRepository } from './domain/channel.repository';
import { UserRepository } from 'src/feature/api/users/domain/user.repository';
import { UserRepositoryImpl } from 'src/feature/api/users/infrastructure/user.repository.impl';
import { UsersUseCases } from 'src/feature/api/users/application/use-case/users.use-case';
import { MikroORM } from '@mikro-orm/postgresql';
import { UsersModule } from 'src/feature/api/users/users.module';
import { ChannelMessageRepository } from './presentation/gateway/channel-message.repository';

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
