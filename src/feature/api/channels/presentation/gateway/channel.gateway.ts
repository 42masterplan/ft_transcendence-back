import { Socket } from 'dgram';
import { UsePipes, ValidationError, ValidationPipe } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ChannelService } from '../../application/channel.service';
import { CreateChannelDto } from '@/src/feature/api/channels/presentation/gateway/dto/create-channel.dto';

@WebSocketGateway()
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
  constructor(private readonly channelService: ChannelService) {}

  async handleConnection(client: any, ...args: any[]) {
    console.log("It's get connected!");
    // 소켓 토큰으로 유저정보 저장하기
    // 유저가 가지고있는 모든 채널에 조인하기
    const channels = await this.channelService.getMyChannels();
    client.join(channels.map((channel) => channel.id));
  }

  handleDisconnect(client: any) {}

  @SubscribeMessage('newMessage')
  async handleMessage(client: Socket, {content, channelId}) {
    console.log('socket newMessage');
    const newMessage = await this.channelService.newMessage(content, channelId);
    this.server.to(channelId).
    emit('newMessage', newMessage);
    return 'success';
  }

  @SubscribeMessage('myChannels')
  async getMyChannels(client: Socket) {
    console.log('socket: myChannels');
    const list = await this.channelService.getMyChannels();
    // console.log(list);
    client.emit('myChannels', list);
  }

  @SubscribeMessage('getPublicChannels')
  async getPublicChannels(client: Socket) {
    console.log('socket: allPublicChannel');
    const channels = await this.channelService.getPublicChannels();
    // console.log(channels);
    client.emit('getPublicChannels', channels);
  }

  @SubscribeMessage('joinChannel')
  async joinChannel(client: Socket, { id, password }) {
    console.log('socket: joinChannel');
    try {
      const ret = await this.channelService.joinChannel({ id, password });
      client.emit('myChannels', await this.channelService.getMyChannels());
      return ret;
    }
    catch (e)
    {
      return '채널 참가에 실패했습니다. 사유 : 모름.';
    }
    
  }

  @SubscribeMessage('myRole')
  async getMyRole(client: Socket, [roomId]) {
    console.log('myRole');
    // console.log(client);
    client.emit('myRole', { role: 'owner' }); // 테이블에 roomId랑 userId검색하기
  }

  @SubscribeMessage('channelHistory')
  async getChannelHistory(client: Socket, roomId) {
    console.log(roomId);
    console.log('socket: channelHistory');
    const history = await this.channelService.getChannelHistory(roomId.roomid);
    console.log(history);
    client.emit('channelHistory', history);
  }

  @SubscribeMessage('createChannel')
  async createChannel(
    client: Socket,
    createChannelDto: CreateChannelDto
  ) {
    console.log('socket: createChannel');
    try
    {
      await this.channelService.createChannel(client, createChannelDto);
    }
    catch(e) {
      return '이미 존재하는 방입니다.';
    }
    client.emit('myChannels', await this.channelService.getMyChannels());
    return 'create Success!';
  }
}
