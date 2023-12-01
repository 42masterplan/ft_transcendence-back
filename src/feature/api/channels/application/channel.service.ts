import { Injectable } from '@nestjs/common';
import { ChannelMessageEntity } from 'src/feature/api/channels/infrastructure/channel-message.entity';
import { ChannelParticipantEntity } from 'src/feature/api/channels/infrastructure/channel-participant.entity';
import { ChannelEntity } from 'src/feature/api/channels/infrastructure/channel.entity';
import { UsersUseCases } from 'src/feature/api/users/application/use-case/users.use-case';
import { ChannelRepository } from '../domain/channel.repository';
import { ChannelMessageRepository } from '../presentation/gateway/channel-message.repository';
import { CreateChannelDto } from '../presentation/gateway/dto/create-channel.dto';
import { PublicChannelDto } from '../presentation/gateway/dto/public-channel.dto';

const hkong = '730f18d5-ffc2-495d-a148-dbf5ec12cf36';
const joushin = '622f9743-20c2-4251-9c34-341ee717b007';
const yejinam = '6df1c752-654e-4d40-b8b2-b842e0e85169';
// const hkong_image = 'http://localhost:8080/resources/kangaroo_boxing.svg';
// const joushin_image = 'http://localhost:8080/resources/koala_health.svg';
// const yejinam_image = 'http://localhost:8080/resources/mouse_health.svg';
const hkong_image = 'http://10.19.233.133:8080/resources/kangaroo_boxing.svg';
const joushin_image = 'http://10.19.233.133:8080/resources/koala_health.svg';
const yejinam_image = 'http://10.19.233.133:8080/resources/mouse_health.svg';
const userId = joushin;
const image = joushin_image;
@Injectable()
export class ChannelService {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly channelMessageRepository: ChannelMessageRepository,
    private readonly usersUseCase: UsersUseCases,
  ) {}

  async getMyChannels() {
    console.log('channel myChannels');
    const myChannelList = await this.channelRepository.findAllByUserId(
      userId,
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
    console.log('service publicChannels');
    const participant = await this.channelRepository.findPublicChannels(
      userId,
    );
    const publicChannelDto =
      await this.channelToPublicChannelDto(participant);
    return publicChannelDto;
  }

  async joinChannel({ id, password }): Promise<string> {
    console.log('service joinChannel');
    const channel = await this.channelRepository.findOneById(id);
    if (!channel) return 'fail';
    if (channel.status == 'private') return 'Unacceptable';
    if (channel.password != password) return 'Wrong password!';
    
    await this.createChannelParticipant('user', userId, channel.id);
    return 'success';
  }

  async newMessage(content: string, channelId: string): Promise<any> {
    const user = await this.usersUseCase.findOne(userId);
    const newMessage = new ChannelMessageEntity();
    newMessage.channelId = channelId;
    newMessage.participantId = userId;
    newMessage.content = content;
    await this.channelMessageRepository.saveOne(newMessage);
    return {
      channelId: channelId,
      userId: userId, 
      userName: user.name, 
      profileImage: image,
      content: content};
  }

  async getChannelHistory(channelId: string) {    
    console.log('service channelHistory');
    const message = await this.channelRepository.getChannelHistory(channelId);
    const history = await this.messageToHistory(message);
    return history;
  }


  async createChannel(client, createChannelDto: CreateChannelDto) {
    console.log('service createChannel');
    if (createChannelDto.name == '')
      client.emit('error_exist', '방 이름을 입력해주세요.');
    const channel = await this.channelRepository.saveChannel(createChannelDto);
    await this.createChannelParticipant('owner', userId, channel.id);
    return 'create Success';
  }

  async messageToHistory(list: ChannelMessageEntity[]) {
    const history = [];
    for await (const data of list) {
      const user = await this.usersUseCase.findOne(data.participantId);
      history.push({
        id: data.participantId,
        name: user.name,
        profileImage: image,
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
      if (channel.status !== 'Public')
        continue;
      const publicChannelDto = new PublicChannelDto();
      publicChannelDto.name = channel.name;
      publicChannelDto.isPassword = channel.password !== ''; // 비밀번호가 비어있지 않으면 true, 그렇지 않으면 false
      publicChannelDto.id = channel.id;
      publicChannelDto.userCount =
        await this.channelRepository.countUser(channel.id);

      publicChannels.push(publicChannelDto);
    }
    return publicChannels;
  }

  async participantToPublicChannelDto(
    participants: ChannelParticipantEntity[],
  ): Promise<PublicChannelDto[]> {
    const publicChannels = (PublicChannelDto[participants.length] = []);

    for (const participant of participants) {
      const channel = await this.channelRepository.findOneById(participant.channelId);
      if(channel.status !== 'Public')
        continue;
      if (publicChannels.some((channel) => channel.id === participant.channelId))
        continue;
      const publicChannelDto = new PublicChannelDto();
      console.log(channel.status);
      publicChannelDto.name = channel.name;
      publicChannelDto.isPassword = channel.password == '' ? false : true; // 비밀번호가 비어있지 않으면 true, 그렇지 않으면 false
      publicChannelDto.id = participant.channelId;
      publicChannelDto.userCount = await this.channelRepository.countUser(
        participant.channelId
      );

      publicChannels.push(publicChannelDto);
    }
    return publicChannels;
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

    await this.channelRepository.saveChannelParticipant(channelParticipant);
    return channelParticipant;
  }
}