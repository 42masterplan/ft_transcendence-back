// auth.guard.ts

import { UsersService } from '../../users/users.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtSocketGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const bearerToken = context
      .getArgs()[0]
      .handshake.auth?.Authorization?.split(' ')[1];
    if (
      bearerToken === null ||
      bearerToken === undefined ||
      bearerToken === '' ||
      bearerToken === 'null' ||
      bearerToken === 'undefined'
    ) {
      return false;
    }

    const decoded = jwt.verify(bearerToken, process.env.AUTH_JWT_SECRET);
    const intraId = decoded.sub as string;
    console.log(bearerToken, intraId);
    // 여기에서 유저 정보가 다 기입되었는지, 로그인이 되었는지 확인하는 로직을 구현합니다.
    if (!intraId) return false;
    const user = await this.usersService.findOneByIntraId(intraId);
    if (
      !user ||
      user.name == null ||
      user.email === null ||
      (user.email !== null && !user.isEmailValidated) ||
      (user.is2faEnabled && !user.is2faValidated)
    )
      return false;
    console.log('finish!');
    return true;
  }
}
