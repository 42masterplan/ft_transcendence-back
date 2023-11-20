import { Module } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelService } from './channel.service';
import { ChannelRepository } from './channel.repository';
import { UserRepository } from 'src/feature/api/users/domain/user.repository';
import { UserRepositoryImpl } from 'src/feature/api/users/infrastructure/user.repository.impl';
import { UsersUseCases } from 'src/feature/api/users/application/use-case/users.use-case';
import { MikroORM } from '@mikro-orm/postgresql';
import { UsersModule } from 'src/feature/api/users/users.module';
import { ChannelMessageRepository } from './channelMessage.repository';

@Module({
  imports: [UsersModule],
  providers: [
    ChannelGateway,
    ChannelService,
    ChannelRepository,
    ChannelMessageRepository,
  ],
})
export class ChannelModule {}
