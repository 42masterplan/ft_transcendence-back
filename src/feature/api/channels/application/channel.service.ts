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
      '72a90435-2e9b-4376-aacb-d679cc1be18f',
    );
    console.log(participant);
    const publicChannelDto =
      await this.participantToPublicChannelDto(participant);
    console.log('list :');
    console.log(publicChannelDto);
    return publicChannelDto;
  }

  async joinChannel({ id, password }): Promise<string> {
    const channel = await this.channelRepository.findOneById(id);
    if (!channel) return 'fail';
    if (channel.status == 'private') return 'Unacceptable';
    if (channel.password != password) return 'Wrong password!';
    const user = await this.usersUseCase.findOne(
      '28cb2d3e-5108-46ca-b2ba-46e71d257ad7',
    );
    await this.createChannelParticipant('user', user, channel);
    return 'success';
  }

  async newMessage(message, roomId): Promise<ChannelMessageEntity> {
    const user = await this.usersUseCase.findOne(
      '28cb2d3e-5108-46ca-b2ba-46e71d257ad7',
    );
    const channel = await this.channelRepository.findOneById(roomId);
    const newMessage = new ChannelMessageEntity();
    return await this.channelMessageRepository.saveOne(newMessage);
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
      // history.push({
      //   id: data.participant,
      //   name: data.participant.name,
      //   profileImage: data.participant.profileImage,
      //   content: data.content,
      //   createdAt: '2021-06-01T14:48:00.000Z',
      //   isBlocked: false, //차단 여부
      // });
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
      publicChannelDto.name = (
        await this.channelRepository.findOneById(participant.channel)
      ).name;
      // publicChannelDto.isPassword = participant.channel.password !== ''; // 비밀번호가 비어있지 않으면 true, 그렇지 않으면 false
      publicChannelDto.id = participant.channel;
      // publicChannelDto.userCount = await this.channelRepository.countUser(
      //   participant.channel,
      // );

      publicChannels.push(publicChannelDto);
    }
    return await publicChannels;
  }

  async createChannel(client, createChannelDto: CreateChannelDto) {
    if (createChannelDto.name == '')
      client.emit('error_exist', '방 이름을 입력해주세요.');
    console.log('service');
    console.log(createChannelDto);
    const user = await this.usersUseCase.findOne(
      '72a90435-2e9b-4376-aacb-d679cc1be18f',
    ); // User
    const channel = await this.channelRepository.saveChannel(createChannelDto);
    await this.createChannelParticipant('owner', user, channel);
    return 'hi';
  }

  async createChannelParticipant(
    role: string,
    user: User,
    channel: ChannelEntity,
  ): Promise<ChannelParticipantEntity> {
    console.log(user);
    console.log(channel);
    const channelParticipant = new ChannelParticipantEntity();
    channelParticipant.role = role;
    channelParticipant.participant = user.id;
    channelParticipant.channel = channel.id;
    channelParticipant.chatableAt = '';
    await this.channelRepository.saveChannelParticipant(channelParticipant);
    return channelParticipant;
  }
}
