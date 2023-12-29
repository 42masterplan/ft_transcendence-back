import { Socket } from 'dgram';
import { UsersUseCase } from '../../../users/application/use-case/users.use-case';
import { ChannelService } from '../../application/channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UsePipes, ValidationError, ValidationPipe } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { getUserFromSocket } from '../../../auth/tools/socketTools';
import { UsersService } from '../../../users/users.service';
import { User } from '../../../users/domain/user';

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
    private readonly channelService: ChannelService,
    private readonly usersUseCase: UsersUseCase,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client, ...args: any[]) {
    console.log("It's get connected!");
    const user = await getUserFromSocket(client, this.usersService);
    // 소켓 토큰으로 유저정보 저장하기
    // 유저가 가지고있는 모든 채널에 조인하기
    this.socketToUser.set(client.id, user.id);
    this.userToSocket.set(user.id, client.id);
    const channels = await this.channelService.getMyChannels(this.socketToUser.get(client.id));
    client.join(channels.map((channel) => channel.id));
    client.emit('myChannels', channels);
  }

  handleDisconnect(client: any) {

  }

  @SubscribeMessage('newMessage')
  async handleMessage(client, { content, channelId }) {
    const myId = this.socketToUser.get(client.id);
    console.log('socket newMessage');
    try {
      const newMessage = await this.channelService.newMessage(myId,
        content,
        channelId,
      );
      this.server.to(channelId).emit('newMessage', newMessage);
    } catch (e) {
      return e.message;
    }
    return 'success';
  }

  @SubscribeMessage('myChannels')
  async getMyChannels(client) {
    const myId = this.socketToUser.get(client.id);
    console.log('socket: myChannels', myId);
    const list = await this.channelService.getMyChannels(myId);
    client.emit('myChannels', list);
  }

  @SubscribeMessage('getPublicChannels')
  async getPublicChannels(client) {
    console.log('socket: allPublicChannel');
    const myId = this.socketToUser.get(client.id);
    const channels = await this.channelService.getPublicChannels(myId);
    client.emit('getPublicChannels', channels);
  }

  @SubscribeMessage('joinChannel')
  async joinChannel(client, { id, password }) {
    console.log('socket: joinChannel');
    const myId = this.socketToUser.get(client.id);
    const ret = await this.channelService.joinChannel(myId, { id, password });
    if (ret != 'joinChannel Success!') return ret;
    client.join(id);
    const newMessage = await this.channelService.newMessage( myId,
      '[system]' + (await this.usersUseCase.findOne(myId)).intraId + '참가함.',
      id,
    );
    client.to(id).emit('newMessage', newMessage);
    client.emit('myChannels', await this.channelService.getMyChannels(myId));
    return ret;
  }

  @SubscribeMessage('channelHistory')
  async getChannelHistory(client, { channelId }) {
    console.log('socket: channelHistory');
    const myId = this.socketToUser.get(client.id);
    const history = await this.channelService.getChannelHistory(myId, channelId);
    return history;
  }

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
      client.join(channelId);
    } catch (e) {
      console.log(e.message);
      return '이미 존재하는 방입니다.';
    }
    client.emit('myChannels', await this.channelService.getMyChannels(myId));
    return 'createChannel Success!';
  }

  @SubscribeMessage('getParticipants')
  async getParticipants(client: any, { channelId }) {
    console.log('socket: getParticipants', channelId);
    const myId = this.socketToUser.get(client.id);
    const participants = await this.channelService.getParticipants(myId, channelId);
    client.emit('getParticipants', participants);
    return 'getParticipants Success!';
  }

  @SubscribeMessage('getBannedUsers')
  async getBannedUsers(client: any, { channelId }: { channelId: string }) {
    console.log('socket: getBannedUsers', channelId);
    const myId = this.socketToUser.get(client.id);
    const bannedUsers = await this.channelService.getBannedUsers(channelId);
    client.emit('getBannedUsers', bannedUsers);
    return 'getBannedUsers Success!';
  }

  @SubscribeMessage('getAdminUsers')
  async getAdminUsers(client: any, { channelId }: { channelId: string }) {
    console.log('socket: getAdminUsers', channelId);
    const myId = this.socketToUser.get(client.id);
    const adminUsers = await this.channelService.getAdminUsers(channelId);
    client.emit('getAdminUsers', adminUsers);
    return 'getAdminUsers Success!';
  }

  @SubscribeMessage('leaveChannel')
  async leaveChannel(client: any, { channelId }: { channelId: string }) {
    console.log('socket: leaveChannel', channelId);
    const myId = this.socketToUser.get(client.id);
    const result = await this.channelService.leaveChannel(myId, channelId);
    if (result != 'leaveChannel Success!') return result;
    const newMessage = await this.channelService.newMessage(
      myId,
      '[system]' + (await this.usersUseCase.findOne(myId)).intraId + '나감.',
      channelId,
    );
    client.to(channelId).emit('newMessage', newMessage);
    client.leave(channelId);
    client.emit('myChannels', await this.channelService.getMyChannels(myId));
    return result;
  }

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
    // this.server.to(channelId).emit('newMessage', newMessage);
    this.channelService.kickUser(myId, channelId, userId);

    this.server.in(channelId).clients(async(error, clients) => {
      if (error) throw error;
        for (const clientId of clients) {
        const myId = this.socketToUser.get(clientId);
        const customizedData = await this.channelService.getMyChannels(myId);
        console.log(myId);
        this.server.to(clientId).emit('myChannels', customizedData);
      }
    });
    // client
    //   .to(channelId)
    //   .emit('myChannels', await this.channelService.getMyChannels(myId));
    
    return 'banUser Success!';
  }

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

    this.server.to(channelId).emit('newMessage', newMessage);
    client
      .to(channelId)
      .emit('myChannels', await this.channelService.getMyChannels(myId));
    return 'kickUser Success!';
  }

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
    this.server.to(channelId).emit('newMessage', newMessage);
    return 'muteUser Success!';
  }

  /*unBanUser,changePassword,changeAdmin 은 사용자 권한이 owner가 아니면 다 실패 */

  @SubscribeMessage('unBanUser')
  async unBanUser(
    client: any,
    { channelId, userId }: { channelId: string; userId: string },
  ) {
    console.log('socket: unBanUser', channelId, userId);
    const myId = this.socketToUser.get(client.id);
    const result = await this.channelService.unBanUser(myId, channelId, userId);
    if (result !== 'unBanUser Success!') {
      console.log(result)
      return result;
    }
    const bannedUsers = await this.channelService.getBannedUsers(channelId);
    client.emit('getBannedUsers', bannedUsers);
  }

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
      client.emit('getAdminUsers', adminUsers);
    }
    // 롤 바뀐애한테 myChannels emit하기
    return result;
  }
}
