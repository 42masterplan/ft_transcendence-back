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

  async handleConnection(client: any, ...args: any[]) {
    console.log("It's get connected!");
    // 소켓 토큰으로 유저정보 저장하기
    // 유저가 가지고있는 모든 채널에 조인하기
    const channels = await this.channelService.getMyChannels();
    client.join(channels.map((channel) => channel.id));
  }

  handleDisconnect(client: any) {}

  @SubscribeMessage('newMessage')
  async handleMessage(client: Socket, [message, roomId]) {
    console.log(message);
    const newMessage = await this.channelService.newMessage(message, roomId);
    this.server.to(roomId).emit('newMessage', roomId, {
      id: newMessage.participant.id,
      name: newMessage.participant.name,
      profileImage: newMessage.participant.profileImage,
      content: newMessage.content,
    });
  }

  @SubscribeMessage('myChannels')
  async getMyChannels(client: Socket) {
    console.log('socket: myChannels');
    const list = await this.channelService.getMyChannels();
    // console.log(list);
    client.emit('myChannels', list);
  }

  @SubscribeMessage('allPublicChannel')
  async getAllPublicChannel(client: Socket) {
    console.log('socket: allPublicChannel');
    const list = await this.channelService.getPublicChannels();
    // console.log(list);
    client.emit('allPublicChannel', list);
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
    createChannelDto: CreateChannelDto,
    done,
  ) {
    console.log('socket: createChannel');
    this.channelService.createChannel(client, createChannelDto);
    console.log(done);
    this.getMyChannels(client);
  }
}
