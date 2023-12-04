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
  constructor(private readonly channelService: ChannelService) {}

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
    const newMessage = await this.channelService.newMessage(content, channelId);
    this.server.to(channelId).emit('newMessage', newMessage);
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
    // console.log(channels);
    client.emit('getPublicChannels', channels);
  }

  @SubscribeMessage('joinChannel')
  async joinChannel(client, { id, password }) {
    console.log('socket: joinChannel');
    try {
			//TODO: 이미 BAN된 경우 return 해주기
      const ret = await this.channelService.joinChannel({ id, password });
      client.join(id);
			//TODO: system message 추가해서 전체 유저한테 보내야함.
				//ex) [system] user가 방에 들어왔습니다.
      client.emit('myChannels', await this.channelService.getMyChannels());
      return ret;
    } catch (e) {
      return '채널 참가에 실패했습니다. 사유 : 모름.';
    }
  }

  @SubscribeMessage('myRole')
  async getMyRole(client: Socket, {channelId}) {
    console.log('myRole');
    // return (await this.channelService.getMyRole(roomId));
    client.emit('myRole', { role: 'owner' ,channelId: channelId});; // 테이블에 roomId랑 userId검색하기
  }

  @SubscribeMessage('channelHistory')
  async getChannelHistory(client: Socket, {channelId}) {
    console.log(channelId);
    console.log('socket: channelHistory');
    const history = await this.channelService.getChannelHistory(channelId);
    console.log(history);
		client.emit('myRole', { role: 'owner' ,channelId: channelId});
    return history;
  }

  @SubscribeMessage('createChannel')
  async createChannel(client: any, createChannelDto: CreateChannelDto) {
    console.log('socket: createChannel');
    try {
      const channelId = await this.channelService.createChannel(client, createChannelDto);
      client.join(channelId);
			client.emit('myRole', { role: 'owner' ,channelId: channelId});
    } catch (e) {
      return '이미 존재하는 방입니다.';
    }
    client.emit('myChannels', await this.channelService.getMyChannels());
    return 'createChannel Success!';
  }

	@SubscribeMessage('getParticipants')
	async getParticipants(client: any, {channelId}: {channelId:string}) {
		console.log('socket: getParticipants',channelId);
		// const participants = await this.channelService.getParticipants(channelId);
		// return participants;
	}

	@SubscribeMessage('getBannedUsers')
	async getBannedUsers(client: any, {channelId}: {channelId:string}) {
		console.log('socket: getBannedUsers',channelId);
		// const bannedUsers = await this.channelService.getBannedUsers(channelId);
		// return bannedUsers;
	}

	@SubscribeMessage('leaveChannel')
	async leaveChannel(client: any, {channelId}: {channelId:string}) {
		console.log('socket: leaveChannel',channelId);
		// await this.channelService.leaveChannel(client, channelId);
		//TODO: system message 추가해서 전체 유저한테 보내야함.
			//ex) [system] user가 방을 나갔습니다.
		client.emit('myChannels', await this.channelService.getMyChannels());
		return 'leaveChannel Success!';
	}

	@SubscribeMessage('banUser')
	async banUser(client: any, {channelId, userId}: {channelId:string, userId:string}) {
		console.log('socket: banUser',channelId, userId);
		// await this.channelService.banUser(client, channelId, userId);
		//TODO: system message 추가해서 전체 유저한테 보내야함.
			//ex) [system] user가 누구에 의해서 BAN되었습니다. 
		//TODO :권한 비교 후 가능한 경우에만 성공 메시지 보내기 실패한 경우에도 return은 꼭 해줘야함
		return 'banUser Success!';
		return 'banUser fail!';
	}

	@SubscribeMessage('kickUser')
	async kickUser(client: any, {channelId, userId}: {channelId:string, userId:string}) {
		console.log('socket: kickUser',channelId, userId);
		// await this.channelService.kickUser(client, channelId, userId);
		//TODO: system message 추가해서 전체 유저한테 보내야함.
			//ex) [system] user가 누구에 의해서 추방 되었습니다. 
		//TODO :권한 비교 후 가능한 경우에만 성공 메시지 보내기 실패한 경우에도 return은 꼭 해줘야함
		return 'kickUser Success!';
		return 'kickUser fail!';
	}

	@SubscribeMessage('muteUser')
	async muteUser(client: any, {channelId, userId}: {channelId:string, userId:string}) {
		console.log('socket: muteUser',channelId, userId);
		// await this.channelService.muteUser(client, channelId, userId);
		//TODO: system message 추가해서 전체 유저한테 보내야함.
			//ex) [system] user가 누구에 의해서 Mute되었습니다. 한동안 말을 할 수 없습니다. 
		//TODO :권한 비교 후 가능한 경우에만 성공 메시지 보내기 실패한 경우에도 return은 꼭 해줘야함
		return 'muteUser Success!';
		return 'muteUser fail!';
	}


/*unbanUser,changePassword,changeAdmin 은 사용자 권한이 owner가 아니면 다 실패 */

	@SubscribeMessage('unbanUser')
	async unbanUser(client: any, {channelId, userId}: {channelId:string, userId:string}) {
		//TODO: 권환 확인해서 권한이 owner가 아니면 다 fail이다.
		console.log('socket: unbanUser',channelId, userId);
		// await this.channelService.unbanUser(client, channelId, userId);
		return 'unbanUser Success!';
		return 'unbanUser fail!';
	}

	@SubscribeMessage('changePassword')
	async changePassword(client: any, {channelId, password}: {channelId:string, password:string}) {
		console.log('socket: changePassword',channelId, password);
		// await this.channelService.changePassword(client, channelId, password);
		return 'changePassword Success!';
	}

	@SubscribeMessage('changeAdmin')
	async changeAdmin(client: any, {channelId, userId,types}: {channelId:string, userId:string,types:'add'|'remove'}) {
		console.log('socket: changeAdmin',channelId, userId);
		// await this.channelService.changeAdmin(client, channelId, userId);
		return 'changeAdmin Success!';
	}
}
