import { UsersService } from '@/src/feature/api/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

/**
 * 소켓에서 유저를 가져오는 메서드입니다.
 * 소켓에 Authorization 헤더에 jwt 토큰이 담겨있어야 합니다.
 * 토큰이 없다면 null을 반환합니다.
 * 토큰이 있다면 토큰을 검증하고, 검증된 토큰에서 유저 아이디를 가져와서 유저를 반환합니다.
 * 토큰이 잘못된 경우에도 null을 반환합니다.
 *
 * jwtService를 주입받아서 사용할지 테스트가 필요합니다.
 */
export async function getUserFromSocket(
  socket: Socket,
  usersService: UsersService,
) {
  const jwtService: JwtService = new JwtService({
    secret: process.env.AUTH_JWT_SECRET,
  });

  const accesstoken = socket.handshake.auth?.Authorization?.split(' ')[1];
  if (!accesstoken) {
    console.log('no token', socket.id);
    return null;
  }
  try {
    const userToken = jwtService.verify(accesstoken);
    const intraId = userToken?.sub;
    console.log('유저: ', intraId);
    const user = await usersService.findOneByIntraId(intraId);
    return user;
  } catch (e) {
    console.log(accesstoken, e);
    return null;
  }
}

export function sendToAllSockets(
  sockets: Map<string, Socket>,
  event: string,
  data: any,
): void {
  sockets.forEach((socket: Socket) => {
    socket.emit(event, data);
  });
}
