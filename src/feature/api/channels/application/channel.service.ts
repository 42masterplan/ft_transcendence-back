import crypto from 'crypto';
import { FindBlockedUserUseCase } from '../../users/application/use-case/find-blocked-user.use-case';
import { Channel } from '../domain/channel';
import { ChannelMessage } from '../domain/channel-message';
import { ChannelMessageRepository } from '../domain/repositories/channel-message.repository';
import { ChannelParticipantRepository } from '../domain/repositories/channel-participant.repository';
import { ChannelUserBannedRepository } from '../domain/repositories/channel-user-banned.repository';
import { ChannelRepository } from '../domain/repositories/channel.repository';
import { CreateChannelDto } from '../presentation/gateway/dto/create-channel.dto';
import { PublicChannelDto } from '../presentation/gateway/dto/public-channel.dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersUseCase } from 'src/feature/api/users/application/use-case/users.use-case';

@Injectable()
export class ChannelService {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly channelMessageRepository: ChannelMessageRepository,
    private readonly channelParticipantRepository: ChannelParticipantRepository,
    private readonly channelUserBannedRepository: ChannelUserBannedRepository,
    private readonly findBlockedUserUseCase: FindBlockedUserUseCase,
    private readonly usersUseCase: UsersUseCase,
  ) {}

  async getMyChannels(userId: string) {
    console.log('channel myChannels', userId);
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
        role: participants.role,
        isUnread: true,
      })),
    );
  }

  async getPublicChannels(userId: string): Promise<PublicChannelDto[]> {
    console.log('service publicChannels');
    const myChannels = await Promise.all(
      (await this.channelParticipantRepository.findAllByUserId(userId)).map(
        (channel) => channel.channelId,
      ),
    );
    const channels = await this.channelRepository.findPublicChannels(
      userId,
      myChannels,
    );
    const channelsDto = await this.channelToPublicChannelDto(channels);

    return channelsDto;
  }

  async getMyRole(userId: string, channelId: string): Promise<string> {
    console.log('service myRole');
    const myRole =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        userId,
        channelId,
      );
    if (!myRole && myRole.isDeleted === true)
      throw new ForbiddenException('You are not in this channel');
    return myRole.role;
  }

  async joinChannel(userId: string, { id, password }): Promise<string> {
    console.log('service joinChannel');
    const channel = await this.channelRepository.findOneById(id);
    password = password.replace(/\s/g, '');
    password = this.hashPassword(password);
    if (!channel) return 'There is no channel';
    if (channel.status === 'Private') return 'Cannot join private channel';
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

  async newMessage(
    userId: string,
    content: string,
    channelId: string,
  ): Promise<any> {
    const user = await this.usersUseCase.findOne(userId);
    const participant =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        userId,
        channelId,
      );
    if (!participant) throw new NotFoundException('You are not in channel');
    if (
      participant.chatableAt > new Date(Date.now()) &&
      !content.startsWith('[system]')
    ) {
      const offset = 1000 * 60 * 60 * 9;
      const muteTime = new Date(participant.chatableAt.getTime() + offset);
      throw new ForbiddenException(
        muteTime.getHours() +
          '시 ' +
          muteTime.getMinutes() +
          '분 까지 뮤트되었습니다.ㅋ',
      );
    }
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

  async getChannelHistory(userId: string, channelId: string) {
    console.log('service channelHistory');
    const blockedUsers = await Promise.all(
      (await this.findBlockedUserUseCase.execute(userId)).map(
        (user) => user.id,
      ),
    );
    const message = await this.channelMessageRepository.findAllByChannelId(
      channelId,
      blockedUsers,
    );
    const history = await this.messageToHistory(message);
    return history;
  }

  async createChannel(
    userId: string,
    client,
    createChannelDto: CreateChannelDto,
  ) {
    console.log('service createChannel');
    if (createChannelDto.name === '')
      client.emit('error_exist', '방 이름이 비었습니다.');
    if (await this.channelRepository.findOneByName(createChannelDto.name))
      throw new ForbiddenException('Already exist channel name');
    createChannelDto.password = createChannelDto.password.replace(/\s/g, '');
    createChannelDto.password = this.hashPassword(createChannelDto.password);
    const channel = await this.channelRepository.saveOne(createChannelDto);
    await this.channelParticipantRepository.saveOne({
      role: 'owner',
      participantId: userId,
      channelId: channel.id,
    });
    for await (const invitedUserId of createChannelDto.invitedFriendIds) {
      if (!invitedUserId) continue;
      await this.channelParticipantRepository.saveOne({
        role: 'user',
        participantId: invitedUserId,
        channelId: channel.id,
      });
    }
    return channel.id;
  }

  async getParticipants(userId: string, channelId: string): Promise<any[]> {
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

  async leaveChannel(userId: string, channelId: string) {
    const channel = await this.channelRepository.findOneById(channelId);
    if (!channel || channel.isDeleted) return 'There is no channel';

    const channelParticipant =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        userId,
        channelId,
      );
    if (!channelParticipant || channelParticipant.isDeleted === true)
      return 'You are not in this channel';
    else if (channelParticipant.role === 'owner') {
      if (
        (await this.channelParticipantRepository.countByChannelId(channelId)) >
        1
      ) {
        const participants =
          await this.channelParticipantRepository.findAllByChannelId(channelId);
        const newOwner = participants[1];
        newOwner.updatedRole('owner');
        await this.channelParticipantRepository.updateOne(newOwner);
      } else {
        channel.updatedIsDeleted(true);
        await this.channelRepository.updateOne(channel);
      }
    }
    channelParticipant.updatedIsDeleted(true);
    await this.channelParticipantRepository.updateOne(channelParticipant);
    return 'leaveChannel Success!';
  }

  async getAdminUsers(channelId: string): Promise<any[]> {
    console.log('service getAdminUsers');
    const channelParticipant =
      await this.channelParticipantRepository.findAllByChannelIdAndRole(
        channelId,
        'admin',
      );
    const adminUsers = [];
    for await (const participant of channelParticipant) {
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

  async banUser(userId: string, channelId: string, targetId: string) {
    if (targetId === userId) return 'Cannot ban yourself';

    const participant =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        userId,
        channelId,
      );
    if (!participant || participant.isDeleted === true)
      return 'You are not in this channel';
    if (participant.role === 'user') return 'You are not admin';

    const isTargetBanned =
      await this.channelUserBannedRepository.findOneByChannelIdAndUserId(
        channelId,
        targetId,
      );
    if (isTargetBanned && isTargetBanned.isDeleted === false)
      return 'Already Banned User';

    const target =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        targetId,
        channelId,
      );
    if (!target) return 'Target is not in this channel';
    if (participant.role !== 'owner' && target.role !== 'user')
      return 'Admin can only ban user';
    if (isTargetBanned) {
      isTargetBanned.updatedIsDeleted(false);
      await this.channelUserBannedRepository.updateOne(isTargetBanned);
    } else this.channelUserBannedRepository.saveOne(targetId, channelId);
    return 'success';
  }

  async unBanUser(userId: string, channelId: string, targetId: string) {
    if (userId === targetId) return 'Cannot unBan yourself';

    const participant =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        userId,
        channelId,
      );
    if (!participant || participant.isDeleted === true)
      return 'You are not in this channel';
    if (participant.role === 'user') return 'You are not admin';

    const isTargetBanned =
      await this.channelUserBannedRepository.findOneByChannelIdAndUserId(
        channelId,
        targetId,
      );
    if (!isTargetBanned || isTargetBanned.isDeleted === true)
      return 'Target is not banned';

    const target =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        targetId,
        channelId,
      );
    if (!target || target.role === 'owner') return 'Admin cannot ban owner!';

    isTargetBanned.updatedIsDeleted(true);
    await this.channelUserBannedRepository.updateOne(isTargetBanned);
    return 'unBanUser Success!';
  }

  async kickUser(
    userId: string,
    channelId: string,
    targetId: string,
  ): Promise<string> {
    if (userId === targetId) return 'Cannot kick yourself';

    const participant =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        userId,
        channelId,
      );
    if (!participant || participant.isDeleted === true)
      return 'You are not in this channel';
    if (participant.role === 'user') return 'You are not admin';

    const target =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        targetId,
        channelId,
      );
    if (!target || target.isDeleted === true)
      return 'Target is not in this channel';
    if (target.role === 'owner') return 'Admin cannot kick owner!';
    target.updatedRole('user');
    target.updatedIsDeleted(true);
    await this.channelParticipantRepository.updateOne(target);
    return 'kickUser Success!';
  }

  async muteUser(
    userId: string,
    channelId: string,
    targetId: string,
  ): Promise<string> {
    if (userId === targetId) return 'Cannot mute yourself';

    const participant =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        userId,
        channelId,
      );
    if (!participant || participant.isDeleted === true)
      return 'You are not in this channel';
    if (participant.role === 'user') return 'You are not admin';

    const target =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        targetId,
        channelId,
      );
    if (!target || target.isDeleted === true)
      return 'Target is not in this channel';
    if (target.role === 'owner') return 'Admin cannot mute owner!';

    target.updatedChatableAt(new Date(Date.now() + 3 * 60000));
    await this.channelParticipantRepository.updateOne(target);
    return 'muteUser Success!';
  }

  async changeAdmin(
    userId: string,
    channelId: string,
    targetId: string,
    types: string,
  ): Promise<string> {
    if (userId === targetId) return 'Cannot change yourself';

    const participant =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        userId,
        channelId,
      );
    if (!participant || participant.isDeleted === true)
      return 'You are not in this channel';
    if (participant.role !== 'owner') return 'You are not owner';

    const target =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        targetId,
        channelId,
      );
    if (!target || target.isDeleted === true)
      return 'Target is not in this channel';
    if (target.role === types) return 'Target is already ' + types;

    target.updatedRole(types);
    await this.channelParticipantRepository.updateOne(target);
    return 'changeAdmin Success!';
  }

  async changePassword(
    userId: string,
    channelId: string,
    password: string,
  ): Promise<string> {
    const participant =
      await this.channelParticipantRepository.findOneByUserIdAndChannelId(
        userId,
        channelId,
      );
    if (!participant || participant.isDeleted === true)
      return 'You are not in this channel';
    if (participant.role !== 'owner') return 'You are not owner';

    const channel = await this.channelRepository.findOneById(channelId);
    if (!channel) return 'There is no channel';
    password = password.replace(/\s/g, '');
    password = this.hashPassword(password);
    channel.updatedPassword(password);
    await this.channelRepository.updateOne(channel);
    return 'changePassword Success!';
  }

  hashPassword(password: string): string {
    if (password === '') return password;
    return crypto
      .createHmac('sha256', process.env.SERVER_HASH_KEY)
      .update(password)
      .digest('base64');
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
