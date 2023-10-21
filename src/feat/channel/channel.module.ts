import { Module } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';

@Module({
  providers: [ChannelGateway],
})
export class ChannelModule {}
