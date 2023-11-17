import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'dgram';
import { CreateChannelDto } from './dto/createChannel.dto';
import { ChannelService } from './channel.service';

@WebSocketGateway(4001)
export class ChannelGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server;
  constructor(private readonly channelService: ChannelService) {}

  handleConnection(client: any, ...args: any[]) {
    console.log("It's get connected!");
  }

  handleDisconnect(client: any) {}

  @SubscribeMessage('newMessage')
  handleMessage(data: any): string {
    // console.log(client);
    console.log(data.msg);
    return data;
  }

  @SubscribeMessage('myChannels')
  async getMyChannels(client: Socket) {}

  @SubscribeMessage('myRole')
  async getMyRole(client: Socket, roomId) {
    console.log(client);
    this.server.emit('myRole', roomId); // 테이블에 roomId랑 userId검색하기
  }

  @SubscribeMessage('createChannel')
  async createChannel(
    client: Socket,
    createChannelDto: CreateChannelDto,
    done,
  ) {
    console.log('socket: createChannel');
    this.channelService.createChannel(client, createChannelDto);
    // done();
    client.emit('myChannels');
  }
}
