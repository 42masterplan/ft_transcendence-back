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
import { PublicChannelDto } from './dto/publicChannel.dto';
import { MyChannelDto } from './dto/myChannel.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { ChannelMessageEntity } from 'src/feature/api/channel/infrastructure/channelMessage.entity';

@WebSocketGateway()
@Injectable()
export class ChannelService {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly usersUseCase: UsersUseCases,
    private readonly em: EntityManager,
  ) {}

  //   async findById(id: string): Promise<ChannelEntity> {
  //     cons room = await this.channelRepository.find(id);
  //     if (!room)
  //   }

  async getMyChannels() {
    const user = await this.usersUseCase.findOne(
      '72f7dd8d-d014-4f9a-ad0a-c378c0ab3ac0',
    );
    const myChannelList = await this.channelRepository.getMyChannels(user.id);
    return Promise.all(
      myChannelList.map(async (list) => ({
        id: list.channel.id,
        name: (await this.channelRepository.findOne(list.channel.id)).name,
        userCount: await this.channelRepository.countUser(list.channel),
        isUnread: true,
      })),
    );
  }

  async getPublicChannels(): Promise<PublicChannelDto[]> {
    const publicChannels =
      await this.channelRepository.getAllByStatus('Public');
    const publicChannelDto =
      await this.channelToPublicChannelDto(publicChannels);
    console.log('list :');
    console.log(publicChannelDto);
    return await publicChannelDto;
  }

  async newMessage(message, roomId): Promise<ChannelMessageEntity> {
    const user = await this.usersUseCase.findOne(
      '72f7dd8d-d014-4f9a-ad0a-c378c0ab3ac0',
    );
    const channel = await this.channelRepository.findOne(roomId);
    console.log(roomId);
    const newMessage = await ChannelMessageEntity.create(
      user,
      channel,
      message,
    );
    return await this.channelRepository.saveMessage(newMessage);
  }

  async getChannelHistory(channelId) {
    const message = await this.channelRepository.getChannelHistory(channelId);
    const history = await this.messageToHistory(message);
    console.log(message);
    return history;
  }

  async messageToHistory(list: ChannelMessageEntity[]) {
    const history = [];

    for (const data of list) {
      history.push({
        id: data.participant.id,
        name: data.participant.name,
        profileImage: data.participant.profileImage,
        content: data.content,
        createdAt: '2021-06-01T14:48:00.000Z',
        isBlocked: false, //차단 여부
      });
    }
    return history;
  }

  async channelToPublicChannelDto(
    channels: ChannelEntity[],
  ): Promise<PublicChannelDto[]> {
    const publicChannels = (PublicChannelDto[channels.length] = []);

    for (const channel of channels) {
      const publicChannelDto = new PublicChannelDto();
      publicChannelDto.name = channel.name;
      publicChannelDto.isPassword = channel.password !== ''; // 비밀번호가 비어있지 않으면 true, 그렇지 않으면 false
      publicChannelDto.id = channel.id;
      publicChannelDto.userCount =
        await this.channelRepository.countUser(channel);

      publicChannels.push(publicChannelDto);
    }
    return await publicChannels;
  }

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
