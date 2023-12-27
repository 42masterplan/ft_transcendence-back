import { JwtSocketGuard } from '../../jwt/socket.guard';
import { NestMiddleware, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketMiddleware implements NestMiddleware {
  constructor(private readonly jwtSocketGuard: JwtSocketGuard) {}

  use(socket: Socket, next: () => void) {
    const data = socket.handshake.query;
    const isAuthorized = true;
    // this.jwtSocketGuard.canActivate([socket, data]);

    if (isAuthorized) {
      return next();
    } else {
      socket.emit('unauthorization', 'Unauthorized');
      socket.disconnect(true);
    }
  }
}
