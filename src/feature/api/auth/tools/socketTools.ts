import * as jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

export function getIntraIdFromSocket(socket: Socket): string {
  try {
    const accessToken = socket.handshake.auth?.Authorization?.split(' ')[1];
    const payload = jwt.verify(accessToken, process.env.AUTH_JWT_SECRET);
    return payload?.sub as string;
  } catch (e) {
    return;
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
