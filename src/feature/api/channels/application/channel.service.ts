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

const hkong = '6df1c752-654e-4d40-b8b2-b842e0e85169';
const joushin = '622f9743-20c2-4251-9c34-341ee717b007';
const yejinam = '6df1c752-654e-4d40-b8b2-b842e0e85169';
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
    console.log('channel myChannels');
    const myChannelList = await this.channelRepository.getMyChannels(
      joushin,
    );
    return await Promise.all(
      myChannelList.map(async (participants) => ({
        id: participants.channelId,
        name: (await this.channelRepository.findOneById(participants.channelId)).name,
        userCount: await this.channelRepository.countUser(participants.channelId),
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
    
    const userId = hkong;
    await this.createChannelParticipant('user', userId, channel.id);
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
        await this.channelRepository.countUser(channel.id);

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
        participant.channelId
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
    const userId = yejinam;
   
    const channel = await this.channelRepository.saveChannel(createChannelDto);
    await this.createChannelParticipant('owner', userId, channel.id);
    
    return 'create Success';
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
