import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';
import { ChannelMessageEntity } from 'src/feature/api/channels/infrastructure/channel-message.entity';
import { ChannelParticipantEntity } from 'src/feature/api/channels/infrastructure/channel-participant.entity';
import { ChannelEntity } from 'src/feature/api/channels/infrastructure/channel.entity';
import { UsersUseCases } from 'src/feature/api/users/application/use-case/users.use-case';
import { UserEntity } from 'src/feature/api/users/infrastructure/user.entity';
import { User } from '../../users/domain/user';
import { ChannelRepository } from '../domain/channel.repository';
import { ChannelMessageRepository } from '../presentation/gateway/channel-message.repository';
import { CreateChannelDto } from '../presentation/gateway/dto/create-channel.dto';
import { PublicChannelDto } from '../presentation/gateway/dto/public-channel.dto';

@WebSocketGateway()
@Injectable()
export class ChannelService {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly channelMessageRepository: ChannelMessageRepository,
    private readonly usersUseCase: UsersUseCases,
  ) {}

  //   async findById(id: string): Promise<ChannelEntity> {
  //     cons room = await this.channelRepository.find(id);
  //     if (!room)
  //   }

  async getMyChannels() {
    // const user = await this.usersUseCase.findOne(
    //   '28cb2d3e-5108-46ca-b2ba-46e71d257ad7',
    // );
    const myChannelList = await this.channelRepository.getMyChannels(
      '28cb2d3e-5108-46ca-b2ba-46e71d257ad7',
    );
    return await Promise.all(
      myChannelList.map(async (list) => ({
        id: list.channel,
        name: (await this.channelRepository.findOneById(list.channel)).name,
        // userCount: await this.channelRepository.countUser(list.channel),
        isUnread: true,
      })),
    );
  }

  async getPublicChannels(): Promise<PublicChannelDto[]> {
    const participant = await this.channelRepository.getPublicChannels(
      joushin,
    );
    console.log('channel getPublicChannels');
    const publicChannelDto =
      await this.participantToPublicChannelDto(participant);
    // console.log('list :');
    // console.log(publicChannelDto);
    return publicChannelDto;
  }

  async joinChannel({ id, password }): Promise<string> {
    console.log('service joinChannel');

    const channel = await this.channelRepository.findOneById(id);
    if (!channel) return 'fail';
    if (channel.status == 'private') return 'Unacceptable';
    if (channel.password != password) return 'Wrong password!';
    
    const userId = joushin;
    await this.createChannelParticipant('user', userId, channel.id);
    console.log("?");
    return 'success';
  }

  async newMessage(message, channelId): Promise<ChannelMessageEntity> {
    const user = await this.usersUseCase.findOne(
      '28cb2d3e-5108-46ca-b2ba-46e71d257ad7',
    );
    const channel = await this.channelRepository.findOneById(channelId);
    const newMessage = new ChannelMessageEntity();
    return await this.channelMessageRepository.saveOne(newMessage);
  }

  async getChannelHistory(channelId) {    
    console.log('service channelHistory');
    const message = await this.channelRepository.getChannelHistory(channelId);
    const history = await this.messageToHistory(message);

    return history;
  }

  async messageToHistory(list: ChannelMessageEntity[]) {
    const history = [];

    for (const data of list) {
      const user = await this.usersUseCase.findOne(data.participantId);
      history.push({
        id: data.participantId,
        name: user.name,
        // profileImage: user;
        content: data.content,
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

  async participantToPublicChannelDto(
    participants: ChannelParticipantEntity[],
  ): Promise<PublicChannelDto[]> {
    const publicChannels = (PublicChannelDto[participants.length] = []);

    for (const participant of participants) {
      const publicChannelDto = new PublicChannelDto();
      const channel = await this.channelRepository.findOneById(participant.channelId);
      publicChannelDto.name = channel.name;
      publicChannelDto.isPassword = channel.password == '' ? false : true; // 비밀번호가 비어있지 않으면 true, 그렇지 않으면 false
      publicChannelDto.id = participant.channelId;
      publicChannelDto.userCount = await this.channelRepository.countUser(
        channel
      );

      if (!publicChannels.some((channel) => channel.id === participant.channelId))
        publicChannels.push(publicChannelDto);
    }
    return await publicChannels;
  }

  async createChannel(client, createChannelDto: CreateChannelDto) {
    if (createChannelDto.name == '')
      client.emit('error_exist', '방 이름을 입력해주세요.');
    console.log('service createChannel');
    const userId = hkong;
    const channel = await this.channelRepository.saveChannel(createChannelDto);
    await this.createChannelParticipant('owner', userId, channel.id);

    return 'hi';
  }

  async createChannelParticipant(
    role: string,
    userId: string,
    channelId: string,
  ): Promise<ChannelParticipantEntity> {
    const channelParticipant = new ChannelParticipantEntity();
    channelParticipant.role = role;
    channelParticipant.participantId = userId;
    channelParticipant.channelId = channelId;
    channelParticipant.chatableAt = '';

    await this.channelRepository.saveChannelParticipant(channelParticipant);
    return channelParticipant;
  }
}
