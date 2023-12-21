import { Socket } from 'dgram';
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
import { UsersUseCases } from '../../../users/application/use-case/users.use-case';

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
  server;
  constructor(private readonly channelService: ChannelService,
    private readonly usersUseCase: UsersUseCases
    ) {}

  async handleConnection(client: any, ...args: any[]) {
    console.log("It's get connected!");
    // 소켓 토큰으로 유저정보 저장하기
    // 유저가 가지고있는 모든 채널에 조인하기
    const channels = await this.channelService.getMyChannels();
    client.join(channels.map((channel) => channel.id));
    client.emit('myChannels', channels);
  }

  handleDisconnect(client: any) {}

  @SubscribeMessage('newMessage')
  async handleMessage(client, { content, channelId }) {
    console.log('socket newMessage');
    try
    {
    const newMessage = await this.channelService.newMessage(content, channelId);
    this.server.to(channelId).emit('newMessage', newMessage);
    }
    catch(e){
      return e.message;
    }
    return 'success';
  }

  @SubscribeMessage('myChannels')
  async getMyChannels(client: Socket) {
    console.log('socket: myChannels');
    const list = await this.channelService.getMyChannels();
    client.emit('myChannels', list);
  }

  @SubscribeMessage('getPublicChannels')
  async getPublicChannels(client: Socket) {
    console.log('socket: allPublicChannel');
    const channels = await this.channelService.getPublicChannels();
    client.emit('getPublicChannels', channels);
  }

  @SubscribeMessage('joinChannel')
  async joinChannel(client, { id, password }) {
    console.log('socket: joinChannel');
    const ret = await this.channelService.joinChannel({ id, password });
    if (ret != 'joinChannel Success!') return ret;
    client.join(id);
    const newMessage = await this.channelService.newMessage(
      '[system] 참가함.',
      id,
    );
    client.to(id).emit('newMessage', newMessage);
    client.emit('myChannels', await this.channelService.getMyChannels());
    return ret;
  }

  @SubscribeMessage('myRole')
  async getMyRole(client: Socket, { channelId }) {
    console.log('myRole');
    try
    {
    const myRole = await this.channelService.getMyRole(channelId);
    client.emit('myRole', { role: myRole, channelId: channelId }); // 테이블에 roomId랑 userId검색하기
    }
    catch (e)
    {
      console.log(e.message)
      return e.message;
    }
  }

  @SubscribeMessage('channelHistory')
  async getChannelHistory(client: Socket, { channelId }) {
    console.log(channelId);
    console.log('socket: channelHistory');
    const history = await this.channelService.getChannelHistory(channelId);
    console.log(history);
    client.emit('myRole', { role: 'owner', channelId: channelId });
    return history;
  }

  @SubscribeMessage('createChannel')
  async createChannel(client: any, createChannelDto: CreateChannelDto) {
    console.log('socket: createChannel');
    try {
      const channelId = await this.channelService.createChannel(
        client,
        createChannelDto,
      );
      client.join(channelId);
      client.emit('myRole', { role: 'owner', channelId: channelId });
    } catch (e) {
      console.log(e.message)
      return '이미 존재하는 방입니다.';
    }
    client.emit('myChannels', await this.channelService.getMyChannels());
    return 'createChannel Success!';
  }

  @SubscribeMessage('getParticipants')
  async getParticipants(client: any, { channelId }) {
    console.log('socket: getParticipants', channelId);
    const participants = await this.channelService.getParticipants(channelId);
    client.emit('getParticipants', participants);
    return 'getParticipants Success!';
  }

  @SubscribeMessage('getBannedUsers')
  async getBannedUsers(client: any, { channelId }: { channelId: string }) {
    console.log('socket: getBannedUsers', channelId);
    const bannedUsers = await this.channelService.getBannedUsers(channelId);
    client.emit('getBannedUsers', bannedUsers);
    return 'getBannedUsers Success!';
  }

  @SubscribeMessage('getAdminUsers')
  async getAdminUsers(client: any, { channelId }: { channelId: string }) {
    console.log('socket: getAdminUsers', channelId);
    const adminUsers = await this.channelService.getAdminUsers(channelId);
    client.emit('getAdminUsers', adminUsers);
    return 'getAdminUsers Success!';
  }

  @SubscribeMessage('leaveChannel')
  async leaveChannel(client: any, { channelId }: { channelId: string }) {
    console.log('socket: leaveChannel', channelId);
    const result = await this.channelService.leaveChannel(channelId);
    if (result != 'leaveChannel Success!') return result;
    const newMessage = await this.channelService.newMessage(
      '[system] 나감.',
      channelId,
    );
    client.to(channelId).emit('newMessage', newMessage);
    client.leave(channelId);
    client.emit('myChannels', await this.channelService.getMyChannels());
    return result;
  }

  @SubscribeMessage('banUser')
  async banUser(
    client: any,
    { channelId, userId }: { channelId: string; userId: string },
  ) {
    console.log('socket: banUser', channelId, userId);
    const result = await this.channelService.banUser(channelId, userId);
    if (result != 'success')
      return result;
    const newMessage = await this.channelService.newMessage(
      '[system]' + (await this.usersUseCase.findOne(userId)).name + '님이 밴되었습니다.',
      channelId,
    );
    this.server.to(channelId).emit('newMessage', newMessage);
    this.channelService.kickUser(channelId, userId);
    client.to(channelId).emit('myChannels', await this.channelService.getMyChannels());
    // 다시생각해봐야함
    return 'banUser Success!';
  }

  @SubscribeMessage('kickUser')
  async kickUser(
    client: any,
    { channelId, userId }: { channelId: string; userId: string },
  ) {
    console.log('socket: kickUser', channelId, userId);
    const result = await this.channelService.kickUser(channelId, userId);
    console.log(result)
    if (result != 'kickUser Success!')
      return result;
    const newMessage = await this.channelService.newMessage(
        '[system]' + (await this.usersUseCase.findOne(userId)).name + '님이 추방되었습니다.',
        channelId,
      );

    this.server.to(channelId).emit('newMessage', newMessage);
    client.to(channelId).emit('myChannels', await this.channelService.getMyChannels());
    return 'kickUser Success!';
  }

  @SubscribeMessage('muteUser')
  async muteUser(
    client: any,
    { channelId, userId }: { channelId: string; userId: string },
  ) {
    console.log('socket: muteUser', channelId, userId);
    const result = await this.channelService.muteUser(channelId, userId);
    if (result != 'muteUser Success!')
      return result;
    const newMessage = await this.channelService.newMessage(
        '[system] ' + (await this.usersUseCase.findOne(userId)).name + '님이 뮤트되었습니다.',
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
    const result = await this.channelService.unBanUser(channelId, userId);
    console.log(result);
    if (result !== 'unBanUser Success!')
    return result;
    const bannedUsers = await this.channelService.getBannedUsers(channelId);
    client.emit('getBannedUsers', bannedUsers);
  }

  @SubscribeMessage('changePassword')
  async changePassword(
    client: any,
    { channelId, password }: { channelId: string; password: string },
  ) {
    console.log('socket: changePassword', channelId, password);
    const result = await this.channelService.changePassword(channelId, password);
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
    const result = await this.channelService.changeAdmin(channelId, userId, types);
    if (result === 'changeAdmin Success!') {
      const adminUsers = await this.channelService.getAdminUsers(channelId);
      client.emit('getAdminUsers', adminUsers);
    }
    return result;
  }
}
