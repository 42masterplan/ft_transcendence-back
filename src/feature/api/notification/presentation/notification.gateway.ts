import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
	ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationError, ValidationPipe } from '@nestjs/common';
import { NotificationUseCases } from '../application/notification.use-case';
import { v4 } from 'uuid';

type gameMode = 'normal' | 'ladder';
type theme = 'default' | 'soccer' | 'swimming' | 'badminton' | 'basketball';
type gameRequest = {
	profileImage: string,
	userName: string,
	matchId: string,
	gameMode: gameMode,
	theme: theme
}
type gameResponse = {
	matchId: string,
	isAccept: boolean
}
type gameCancel = {
	matchId: string
}
type gameStart = {
	matchId: string,
	theme: theme
}
type gameEnd = {
	matchId: string,
	winner: string
}

type MatchStore = {
	srcId: string,
	destId: string,
	gameMode: gameMode,
	theme: theme
}


@WebSocketGateway({ namespace: 'alarm' })
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
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor() {}
	@WebSocketServer()
	private readonly server: Server;
	private sockets: Map<string, string> = new Map();
	private requestQueue: Map<string, MatchStore> = new Map();
	/**
   * 'alarm' 네임스페이스에 연결되었을 때 실행되는 메서드입니다.
   *  유저가 이미 네임스페이스에 연결된 소켓을 가지고 있다면, 이전 소켓을 끊고 새로운 소켓으로 교체합니다.
   */
  async handleConnection(@ConnectedSocket() socket: Socket) {
    // const user = getUserFromSocket(socket, this.userFactory);
		//유저가 없는 경우는 끊어버린다.(있어선 안되는 상황)
    // if (!user) {
      // socket.disconnect();
      // return;
    // }
		//TODO: JWT를 이용해서 해당 정보를 가져올 것 현재 임시로 넣음
		const user = {id: '622f9743-20c2-4251-9c34-341ee717b007', name: 'joushin', profileImage: 'http://localhost:8080/resources/sloth_health.svg'};
    this.sockets.set(user.id, socket.id);
  }
	
	/**
	 * 
	 * 연결이 끊어졌을 때 실행되는 메서드입니다.
	 * map에서 해당 유저와 매핑된 소켓 정보를 삭제해줍니다.
	 */
	async handleDisconnect(@ConnectedSocket() socket: Socket) {
		// const user= getUserFromSocket(socket, this.userFactory);
    // if (!user) return;
		//TODO: JWT를 이용해서 해당 정보를 가져올 것
		const user = {id: '622f9743-20c2-4251-9c34-341ee717b007', name: 'joushin', profileImage: 'http://localhost:8080/resources/sloth_health.svg'};
    this.sockets.delete(user.id);
	}

	@SubscribeMessage('gameRequest')
	async handleGameRequest(client, { userId , gameMode, theme }) {
		const receiverSocketId = this.sockets.get(userId);
		const matchId = v4();
		const srcId = '622f9743-20c2-4251-9c34-341ee717b007';//게임 요청을 보낸 사람의 아이디
		const destId = userId;//요청을 받는 사람의 아이디
		this.requestQueue.set(matchId, {srcId, destId, gameMode, theme});
		// const useInfo = getUserInfo(srcId);
		//TODO : 유저 정보를 가져올 것
		const userInfo = {name: 'joushin', profileImage: 'http://localhost:8080/resources/sloth_health.svg'};
    this.server.to(receiverSocketId).emit('gameRequest',{
			profileImage: userInfo.profileImage,
			userName: userInfo.name,
			matchId: matchId,
			gameMode: gameMode,
			theme: theme
		});
    return 'gameRequest success!';
		//실패한 경우 
		//자유로은 실패 메시지
  }

	@SubscribeMessage('gameResponse')
  async handleGameResponse(client, { isAccept,
	matchId }) {
		//이전에 할당된 매칭 큐를 확인해서 pop해준다.
		//MAP으로, 새로운 requestId할당.
		//객체 == [{requestId, userA, userB, theme} ...]
		//두명의 유저에게 gameStart를 동시에 emit해준다.
		const matchInfo = this.requestQueue.get(matchId);
		const userSocketId = this.sockets.get(matchInfo.srcId);
	// 	const userA,B;
	if (isAccept) {
    this.server.to(userSocketId).emit('gameStart',{
			matchId: matchId,
			theme: matchInfo.theme
		});
	}
	this.requestQueue.delete(matchId);
  return 'gameRequest success!';
		//실패한 경우 
		//자유로은 실패 메시지
  }

	@SubscribeMessage('gameCancel')
	async handleGameCancel(client, data) {
		console.log('socket gameCancel');
		this.server.emit('gameCancel', data);
		return 'success';
	}	
}
