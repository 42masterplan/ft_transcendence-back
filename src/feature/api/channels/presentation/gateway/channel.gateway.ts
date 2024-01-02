import { AuthService } from '../../../auth/auth.service';
import { JwtSocketGuard } from '../../../auth/jwt/jwt-socket.guard';
import { BlockedUserUseCase } from '../../../users/application/use-case/blocked-user.use-case';
import { UsersUseCase } from '../../../users/application/use-case/users.use-case';
import { UsersService } from '../../../users/users.service';
import { ChannelService } from '../../application/channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import {
  UseGuards,
  UsePipes,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

@WebSocketGateway({ namespace: 'channel' })
@UsePipes(
  new ValidationPipe({
    exceptionFactory(validationErrors: ValidationError[] = []) {
      if (this.isDetailedOutputDisable) {
        return new WsException('');
      }
      const errors = this.flattenValidationErrors(validationErrors);
      console.log(new WsException(errors));
      return new WsException(errors);
    },
  }),
)
export class ChannelGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server;
  private socketToUser: Map<string, string> = new Map();
  private userToSocket: Map<string, string> = new Map();
  constructor(
    private readonly authService: AuthService,
    private readonly channelService: ChannelService,
    private readonly blockedUserUseCase: BlockedUserUseCase,
    private readonly usersUseCase: UsersUseCase,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client, ...args: any[]) {
    console.log("It's get connected!");
    const token = client.handshake.auth?.Authorization?.split(' ')[1];
    const user = await this.authService.verifySocket(token);
    if (!user) {
      client.disconnect();
      return;
    }
    // 소켓 토큰으로 유저정보 저장하기
    // 유저가 가지고있는 모든 채널에 조인하기
    if (this.socketToUser.has(client.id)) {
      client.disconnect();
      return;
    }
    this.socketToUser.set(client.id, user.id);
    this.userToSocket.set(user.id, client.id);
    const channels = await this.channelService.getMyChannels(
      this.socketToUser.get(client.id),
    );
    client.join(channels.map((channel) => channel.id));
    client.emit('myChannels', channels);
  }

  async handleDisconnect(client: any) {
    console.log("It's get disconnected!");
    // 소켓 토큰으로 유저정보 삭제하기
    // 유저가 가지고있는 모든 채널에서 나가기
    const myId = this.socketToUser.get(client.id);
    this.socketToUser.delete(client.id);
    this.userToSocket.delete(myId);
    const channels = await this.channelService.getMyChannels(
      this.socketToUser.get(client.id),
    );
    client.leave(channels.map((channel) => channel.id));
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('newMessage')
  async handleMessage(client, { content, channelId }) {
    const myId = this.socketToUser.get(client.id);
    console.log('socket newMessage');
    try {
      const newMessage = await this.channelService.newMessage(
        myId,
        content,
        channelId,
      );
      await this.newMessageInRoom(channelId, newMessage);
    } catch (e) {
      return e.message;
    }
    return 'success';
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('myChannels')
  async getMyChannels(client) {
    const myId = this.socketToUser.get(client.id);
    console.log('socket: myChannels', myId);
    const list = await this.channelService.getMyChannels(myId);
    client.emit('myChannels', list);
  }

  async getMyChannelsInRoom(room: string) {
    const clients = this.server.adapter.rooms.get(room);
    if (clients) {
      for (const client of clients) {
        const myId = this.socketToUser.get(client);
        const list = await this.channelService.getMyChannels(myId);
        this.server.to(client).emit('myChannels', list);
      }
    }
  }

  async newMessageInRoom(room: string, newMessage) {
    const clients = this.server.adapter.rooms.get(room);
    if (clients) {
      for (const client of clients) {
        const myId = this.socketToUser.get(client);
        if (
          await this.blockedUserUseCase.isBlocked({
            myId: myId,
            targetId: newMessage.userId,
          })
        )
          continue;
        this.server.to(client).emit('newMessage', newMessage);
      }
    }
  }

  async getPublicChannelsToAll() {
    const clients = this.server.sockets.keys();
    if (clients) {
      for (const client of clients) {
        const myId = this.socketToUser.get(client);
        const channels = await this.channelService.getPublicChannels(myId);
        this.server.to(client).emit('getPublicChannels', channels);
      }
    }
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('getPublicChannels')
  async getPublicChannels(client) {
    console.log('socket: allPublicChannel');
    const myId = this.socketToUser.get(client.id);
    const channels = await this.channelService.getPublicChannels(myId);
    client.emit('getPublicChannels', channels);
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('joinChannel')
  async joinChannel(client, { id, password }) {
    console.log('socket: joinChannel');
    const myId = this.socketToUser.get(client.id);
    const ret = await this.channelService.joinChannel(myId, { id, password });
    if (ret != 'joinChannel Success!') return ret;
    client.join(id);
    await this.getMyChannelsInRoom(id);
    const newMessage = await this.channelService.newMessage(
      myId,
      '[system] ' +
        (await this.usersUseCase.findOne(myId)).name +
        ' 참가했습니다.',
      id,
    );
    this.newMessageInRoom(id, newMessage);
    await this.getPublicChannelsToAll();
    return ret;
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('channelHistory')
  async getChannelHistory(client, { channelId }) {
    console.log('socket: channelHistory');
    const myId = this.socketToUser.get(client.id);
    const history = await this.channelService.getChannelHistory(
      myId,
      channelId,
    );
    return history;
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('createChannel')
  async createChannel(client: any, createChannelDto: CreateChannelDto) {
    console.log('socket: createChannel');
    const myId = this.socketToUser.get(client.id);
    try {
      const channelId = await this.channelService.createChannel(
        myId,
        client,
        createChannelDto,
      );

      for (const invitedUser of createChannelDto.invitedFriendIds) {
        if (!invitedUser) continue;
        const socket = this.userToSocket.get(invitedUser);
        if (socket) this.server.sockets.get(socket).join(channelId);
      }
      client.join(channelId);
      await this.getMyChannelsInRoom(channelId);
    } catch (e) {
      console.log(e.message);
      return '이미 존재하는 방입니다.';
    }
    await this.getPublicChannelsToAll();
    return 'createChannel Success!';
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('getParticipants')
  async getParticipants(client: any, { channelId }) {
    console.log('socket: getParticipants', channelId);
    const myId = this.socketToUser.get(client.id);
    const participants = await this.channelService.getParticipants(
      myId,
      channelId,
    );
    client.emit('getParticipants', {
      participants: participants,
      channelId: channelId,
    });
    return 'getParticipants Success!';
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('getBannedUsers')
  async getBannedUsers(client: any, { channelId }: { channelId: string }) {
    console.log('socket: getBannedUsers', channelId);
    const myId = this.socketToUser.get(client.id);
    const bannedUsers = await this.channelService.getBannedUsers(channelId);
    client.emit('getBannedUsers', {
      bannedUsers: bannedUsers,
      channelId: channelId,
    });
    return 'getBannedUsers Success!';
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('getAdminUsers')
  async getAdminUsers(client: any, { channelId }: { channelId: string }) {
    console.log('socket: getAdminUsers', channelId);
    const myId = this.socketToUser.get(client.id);
    const adminUsers = await this.channelService.getAdminUsers(channelId);
    client.emit('getAdminUsers', {
      adminUsers: adminUsers,
      channelId: channelId,
    });
    return 'getAdminUsers Success!';
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('leaveChannel')
  async leaveChannel(client: any, { channelId }: { channelId: string }) {
    console.log('socket: leaveChannel', channelId);
    const myId = this.socketToUser.get(client.id);
    const result = await this.channelService.leaveChannel(myId, channelId);
    if (result != 'leaveChannel Success!') return result;
    const newMessage = await this.channelService.newMessage(
      myId,
      '[system]' +
        (await this.usersUseCase.findOne(myId)).name +
        ' 떠났습니다.',
      channelId,
    );
    await this.newMessageInRoom(channelId, newMessage);
    await this.getMyChannelsInRoom(channelId);
    await this.getPublicChannelsToAll();
    client.leave(channelId);
    return result;
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('banUser')
  async banUser(
    client: any,
    { channelId, userId }: { channelId: string; userId: string },
  ) {
    console.log('socket: banUser', channelId, userId);
    const myId = this.socketToUser.get(client.id);
    const result = await this.channelService.banUser(myId, channelId, userId);
    if (result != 'success') return result;
    const newMessage = await this.channelService.newMessage(
      myId,
      '[system]' +
        (await this.usersUseCase.findOne(userId)).name +
        '님이 밴되었습니다.',
      channelId,
    );
    await this.channelService.kickUser(myId, channelId, userId);
    await this.newMessageInRoom(channelId, newMessage);
    await this.getMyChannelsInRoom(channelId);
    await this.getPublicChannelsToAll();
    this.server.to(channelId).emit('getParticipants', {
      participants: await this.channelService.getParticipants(myId, channelId),
      channelId: channelId,
    });
    this.server.to(channelId).emit('getBannedUsers', {
      bannedUsers: await this.channelService.getBannedUsers(channelId),
      channelId: channelId,
    });
    client.leave(channelId);

    return 'banUser Success!';
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('kickUser')
  async kickUser(
    client: any,
    { channelId, userId }: { channelId: string; userId: string },
  ) {
    console.log('socket: kickUser', channelId, userId);
    const myId = this.socketToUser.get(client.id);
    const result = await this.channelService.kickUser(myId, channelId, userId);
    if (result != 'kickUser Success!') return result;
    const newMessage = await this.channelService.newMessage(
      myId,
      '[system]' +
        (await this.usersUseCase.findOne(userId)).name +
        '님이 추방되었습니다.',
      channelId,
    );
    await this.newMessageInRoom(channelId, newMessage);
    await this.getMyChannelsInRoom(channelId);
    await this.getPublicChannelsToAll();
    this.server.to(channelId).emit('getParticipants', {
      participants: await this.channelService.getParticipants(myId, channelId),
      channelId: channelId,
    });
    return 'kickUser Success!';
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('muteUser')
  async muteUser(
    client: any,
    { channelId, userId }: { channelId: string; userId: string },
  ) {
    console.log('socket: muteUser', channelId, userId);
    const myId = this.socketToUser.get(client.id);
    const result = await this.channelService.muteUser(myId, channelId, userId);
    if (result != 'muteUser Success!') return result;
    const newMessage = await this.channelService.newMessage(
      myId,
      '[system] ' +
        (await this.usersUseCase.findOne(userId)).name +
        '님이 뮤트되었습니다.',
      channelId,
    );
    this.newMessageInRoom(channelId, newMessage);
    return 'muteUser Success!';
  }

  /*unBanUser,changePassword,changeAdmin 은 사용자 권한이 owner가 아니면 다 실패 */
  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('unBanUser')
  async unBanUser(
    client: any,
    { channelId, userId }: { channelId: string; userId: string },
  ) {
    console.log('socket: unBanUser', channelId, userId);
    const myId = this.socketToUser.get(client.id);
    const result = await this.channelService.unBanUser(myId, channelId, userId);
    if (result !== 'unBanUser Success!') return result;
    const newMessage = await this.channelService.newMessage(
      myId,
      '[system]' +
        (await this.usersUseCase.findOne(userId)).name +
        '님이 밴 해제 되었습니다.',
      channelId,
    );
    await this.newMessageInRoom(channelId, newMessage);
    await this.getMyChannelsInRoom(channelId);
    await this.getPublicChannelsToAll();

    this.server.to(channelId).emit('getBannedUsers', {
      bannedUsers: await this.channelService.getBannedUsers(channelId),
      channelId: channelId,
    });
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('changePassword')
  async changePassword(
    client: any,
    { channelId, password }: { channelId: string; password: string },
  ) {
    console.log('socket: changePassword', channelId, password);
    const myId = this.socketToUser.get(client.id);
    const result = await this.channelService.changePassword(
      myId,
      channelId,
      password,
    );
    return result;
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage('changeAdmin')
  async changeAdmin(
    client: any,
    {
      channelId,
      userId,
      types,
    }: { channelId: string; userId: string; types: 'admin' | 'user' },
  ) {
    console.log('socket: changeAdmin', channelId, userId);
    const myId = this.socketToUser.get(client.id);
    const result = await this.channelService.changeAdmin(
      myId,
      channelId,
      userId,
      types,
    );
    if (result === 'changeAdmin Success!') {
      const adminUsers = await this.channelService.getAdminUsers(channelId);
      client.emit('getAdminUsers', {
        adminUsers: adminUsers,
        channelId: channelId,
      });
    }
    const socket = this.userToSocket.get(userId);
    if (socket)
      this.server
        .to(socket)
        .emit('myChannels', await this.channelService.getMyChannels(userId));
    return result;
  }
}
