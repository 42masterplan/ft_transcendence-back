import { Channel } from '../domain/channel';
import { ChannelMessage } from '../domain/channel-message';
import { ChannelMessageRepository } from '../domain/repositories/channel-message.repository';
import { ChannelParticipantRepository } from '../domain/repositories/channel-participant.repository';
import { ChannelUserBannedRepository } from '../domain/repositories/channel-user-banned.repository';
import { ChannelRepository } from '../domain/repositories/channel.repository';
import { CreateChannelDto } from '../presentation/gateway/dto/create-channel.dto';
import { PublicChannelDto } from '../presentation/gateway/dto/public-channel.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ChannelParticipantEntity } from 'src/feature/api/channels/infrastructure/channel-participant.entity';
import { UsersUseCases } from 'src/feature/api/users/application/use-case/users.use-case';

const hkong = '730f18d5-ffc2-495d-a148-dbf5ec12cf36';
const joushin = '622f9743-20c2-4251-9c34-341ee717b007';
const yejinam = '6df1c752-654e-4d40-b8b2-b842e0e85169';
const userName = 'joushin';
const userId = joushin;
@Injectable()
export class ChannelService {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly channelMessageRepository: ChannelMessageRepository,
    private readonly channelParticipantRepository: ChannelParticipantRepository,
    private readonly channelUserBannedRepository: ChannelUserBannedRepository,
    private readonly usersUseCase: UsersUseCases,
  ) {}

  async getMyChannels() {
    console.log('channel myChannels');
    const myChannelList =
      await this.channelParticipantRepository.findAllByUserId(userId);
    return await Promise.all(
      myChannelList.map(async (participants) => ({
        id: participants.channelId,
        name: (await this.channelRepository.findOneById(participants.channelId))
          .name,
        userCount: await this.channelParticipantRepository.countByChannelId(
          participants.channelId,
        ),
        isUnread: true,
      })),
    );
  }

  async getPublicChannels(): Promise<PublicChannelDto[]> {
    console.log('service publicChannels');
    const myChannels = (
      await this.channelParticipantRepository.findAllByUserId(userId)
    ).map((channel) => channel.channelId);
    const channels = await this.channelRepository.findPublicChannels(
      userId,
      myChannels,
    );
    const channelsDto = await this.channelToPublicChannelDto(channels);

    return channelsDto;
  }

  async getMyRole(channelId: string): Promise<string> {
    console.log('service myRole');
    const myRole =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        userId,
        channelId,
      );
    if (!myRole && myRole.isDeleted === true)
      return 'You are not in this channel';
    return myRole.role;
  }

  async joinChannel({ id, password }): Promise<string> {
    console.log('service joinChannel');
    const channel = await this.channelRepository.findOneById(id);
    if (!channel) return 'There is no channel';
    if (channel.status === 'private') return 'Cannot join private channel';
    if (channel.password != password) return 'Wrong password!';

    const isBanned =
      await this.channelUserBannedRepository.findOneByChannelIdAndUserId(
        id,
        userId,
      );
    if (isBanned && isBanned.isDeleted === false) return 'Banned User';

    const user =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        userId,
        id,
      );
    if (!user)
      await this.channelParticipantRepository.saveOne({
        role: 'user',
        participantId: userId,
        channelId: channel.id,
      });
    else if (user.isDeleted === true) {
      user.updatedIsDeleted(false);
      user.updatedRole('user');
      await this.channelParticipantRepository.updateOne(user);
    } else {
      return 'Already joined';
    }
    return 'joinChannel Success!';
  }

  async newMessage(content: string, channelId: string): Promise<any> {
    const user = await this.usersUseCase.findOne(userId);
    const participant = await this.channelParticipantRepository.findOneByUserIdAndChannelId(
      userId,
      channelId,
    );
    if (!participant || participant.isDeleted === true)
      throw new ForbiddenException('You are not in this channel');
    if (participant.chatableAt > new Date(Date.now()))
      throw new ForbiddenException('You are muted');
    await this.channelMessageRepository.saveOne({
      channelId: channelId,
      participantId: userId,
      content,
    });
    return {
      channelId: channelId,
      userId: userId,
      userName: user.name,
      profileImage: user.profileImage,
      content: content,
    };
  }

  async getChannelHistory(channelId: string) {
    console.log('service channelHistory');
    const message =
      await this.channelMessageRepository.findAllByChannelId(channelId);
    const history = await this.messageToHistory(message);
    return history;
  }

  async createChannel(client, createChannelDto: CreateChannelDto) {
    console.log('service createChannel');
    if (createChannelDto.name === '')
      client.emit('error_exist', '방 이름을 입력해주세요.');
    const channel = await this.channelRepository.saveOne(createChannelDto);
    await this.createChannelParticipant('owner', userId, channel.id);
    return channel.id;
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

    await this.channelParticipantRepository.saveOne(channelParticipant);
    return channelParticipant;
  }

  async getParticipants(channelId: string): Promise<any[]> {
    const channelParticipant =
      await this.channelParticipantRepository.findAllByChannelId(channelId);
    const participants = [];
    for await (const participant of channelParticipant) {
      if (participant.participantId === userId) continue;
      const user = await this.usersUseCase.findOne(participant.participantId);
      participants.push({
        channelId: participant.channelId,
        userId: user.id,
        userName: user.name,
        profileImage: user.profileImage,
      });
    }
    console.log(participants);
    return participants;
  }

  async getBannedUsers(channelId: string): Promise<any[]> {
    const channelBannedUsers =
      await this.channelUserBannedRepository.findAllByChannelId(channelId);
    const bannedUsers = [];
    for await (const bannedUser of channelBannedUsers) {
      if (bannedUser.isDeleted === true) continue;
      const user = await this.usersUseCase.findOne(bannedUser.userId);
      bannedUsers.push({
        channelId: bannedUser.channelId,
        userId: user.id,
        userName: user.name,
        profileImage: user.profileImage,
      });
    }
    return bannedUsers;
  }

  async leaveChannel(channelId: string) {
    const channel = this.channelRepository.findOneById(channelId);
    if (!channel) return 'There is no channel';

    const channelParticipant =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        userId,
        channelId,
      );
    if (!channelParticipant || channelParticipant.isDeleted === true)
      return 'You are not in this channel';
    else {
      channelParticipant.updatedIsDeleted(true);
      await this.channelParticipantRepository.updateOne(channelParticipant);
    }
    return 'leaveChannel Success!';
    //구현중
  }

  async getAdminUsers(channelId: string): Promise<any[]> {
    const channelParticipant =
      await this.channelParticipantRepository.findAllByChannelId(channelId);
    const adminUsers = [];
    for await (const participant of channelParticipant) {
      if (participant.role === 'user') continue;
      const user = await this.usersUseCase.findOne(participant.participantId);
      adminUsers.push({
        channelId: participant.channelId,
        userId: user.id,
        userName: user.name,
        profileImage: user.profileImage,
      });
    }
    return adminUsers;
  }

  async banUser(channelId: string, targetId: string) {
    if (targetId === userId) return 'Cannot ban yourself';

    const participant = await this.channelParticipantRepository.findOneByUserIdAndChannelId(
      userId,
      channelId);
    if (!participant || participant.isDeleted === true) 
      return 'You are not in this channel';
    if (participant.role === 'user')
      return 'You are not admin';

    const isTargetBanned =
      await this.channelUserBannedRepository.findOneByChannelIdAndUserId(
        channelId,
        targetId,
      );
    if (isTargetBanned && isTargetBanned.isDeleted === false) return 'Already Banned User';

    const target = await this.channelParticipantRepository.findOneByUserIdAndChannelId(
      targetId,
      channelId);
    if (!target || target.isDeleted === true) 
      return 'Target is not in this channel';
    if (participant.role !== 'owner' && target.role !== 'user')
      return 'Admin can only ban user';

    this.channelUserBannedRepository.saveOne(targetId, channelId);
    return 'success'
  }

  async unBanUser(channelId: string, targetId: string) {
    if (userId === targetId)
      return 'Cannot unBan yourself';

    const participant = await this.channelParticipantRepository.findOneByUserIdAndChannelId(
      userId,
      channelId);
    if (!participant || participant.isDeleted === true)
      return 'You are not in this channel';
    if (participant.role === 'user')
      return 'You are not admin';

    const isTargetBanned = 
      await this.channelUserBannedRepository.findOneByChannelIdAndUserId(
        channelId,
        targetId,
      );
    if (!isTargetBanned || isTargetBanned.isDeleted === true)
      return 'Target is not banned';

    const target = await this.channelParticipantRepository.findOneByUserIdAndChannelId(
      targetId,
      channelId);
    if (participant.role !== 'owner' && target.role !== 'user')
      return 'Admin can only ban user';

    isTargetBanned.updatedIsDeleted(true);
    this.channelUserBannedRepository.updateOne(isTargetBanned);
    return 'unBanUser Success!'
  }

  async kickUser(channelId: string, targetId: string): Promise<string>
  {
    if (userId === targetId) return 'Cannot kick yourself';

    const participant = await this.channelParticipantRepository.findOneByUserIdAndChannelId(
      userId,
      channelId);
    if (!participant || participant.isDeleted === true) 
      return 'You are not in this channel';
    if (participant.role === 'user')
      return 'You are not admin';

    const target = await this.channelParticipantRepository.findOneByUserIdAndChannelId(
      targetId,
      channelId);
    if (!target || target.isDeleted === true) 
      return 'Target is not in this channel';
    if (participant.role !== 'owner' && target.role !== 'user')
      return 'Admin can only kick user';

    target.updatedIsDeleted(true);

    await this.channelParticipantRepository.updateOne(target);
    return 'kickUser Success!'
  }

  async muteUser(channelId: string, targetId: string): Promise<string> {
    if (userId === targetId)
      return 'Cannot mute yourself';

    const participant = await this.channelParticipantRepository.findOneByUserIdAndChannelId(
      userId,
      channelId);
    if (!participant || participant.isDeleted === true) 
      return 'You are not in this channel';
    if (participant.role === 'user')
      return 'You are not admin';

    const target = await this.channelParticipantRepository.findOneByUserIdAndChannelId(
      targetId,
      channelId);
    if (!target || target.isDeleted === true) 
      return 'Target is not in this channel';
    if (participant.role !== 'owner' && target.role !== 'user')
      return 'Admin can only kick user';
    
    target.updatedChatableAt(new Date(Date.now() + 60000));
    await this.channelParticipantRepository.updateOne(target);
    return 'muteUser Success!';
  }

  async changePassword(channelId: string, password: string): Promise<string> {
    const participant = await this.channelParticipantRepository.findOneByUserIdAndChannelId(
      userId,
      channelId);
    if (!participant || participant.isDeleted === true) 
      return 'You are not in this channel';
    if (participant.role !== 'owner')
      return 'You are not owner';

    const channel = await this.channelRepository.findOneById(channelId);
    if (!channel) return 'There is no channel';
    channel.updatedPassword(password);
    await this.channelRepository.updateOne(channel);
    return 'changePassword Success!';
  }

  async messageToHistory(list: ChannelMessage[]) {
    const history = [];
    for await (const data of list) {
      const user = await this.usersUseCase.findOne(data.participantId);
      history.push({
        id: data.participantId,
        name: user.name,
        profileImage: user.profileImage,
        content: data.content,
      });
    }
    return history;
  }

  async channelToPublicChannelDto(
    channels: Channel[],
  ): Promise<PublicChannelDto[]> {
    const publicChannels = (PublicChannelDto[channels.length] = []);

    for (const channel of channels) {
      if (channel.status !== 'Public') continue;
      const publicChannelDto = new PublicChannelDto();
      publicChannelDto.name = channel.name;
      publicChannelDto.isPassword = channel.password !== ''; // 비밀번호가 비어있지 않으면 true, 그렇지 않으면 false
      publicChannelDto.id = channel.id;
      publicChannelDto.userCount =
        await this.channelParticipantRepository.countByChannelId(channel.id);

      publicChannels.push(publicChannelDto);
    }
    return publicChannels;
  }
}
