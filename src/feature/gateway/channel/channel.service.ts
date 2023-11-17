import { Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/createChannel.dto';
import { WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChannelRepository } from './channel.repository';
import { ChannelEntity } from 'src/feature/api/channel/infrastructure/channel.entity';
import { UserRepository } from 'src/feature/api/users/domain/user.repository';
import { ChannelParticipantEntity } from 'src/feature/api/channel/infrastructure/channelParticipant.entity';
import { UserEntity } from 'src/feature/api/users/infrastructure/user.entity';
import { UsersUseCases } from 'src/feature/api/users/application/use-case/users.use-case';

@WebSocketGateway()
@Injectable()
export class ChannelService {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly usersUseCase: UsersUseCases,
  ) {}

  //   async findById(id: string): Promise<ChannelEntity> {
  //     cons room = await this.channelRepository.find(id);
  //     if (!room)
  //   }

  async createChannel(client, createChannelDto: CreateChannelDto) {
    if (createChannelDto.channelName == '')
      client.emit('error_exist', '방 이름을 입력해주세요.');
    console.log('service');
    console.log(createChannelDto);
    const user = await this.usersUseCase.findOne(
      '72f7dd8d-d014-4f9a-ad0a-c378c0ab3ac0',
    );
    const channel = await this.channelRepository.saveChannel(createChannelDto);
    this.createChannelParticipant('owner', user, channel);
  }

  async createChannelParticipant(
    role: string,
    user: UserEntity,
    channel: ChannelEntity,
  ): Promise<ChannelParticipantEntity> {
    const channelParticipant = ChannelParticipantEntity.create(
      role,
      channel,
      user,
    );
    this.channelRepository.saveChannelParticipant(channelParticipant);
    return channelParticipant;
  }
}
