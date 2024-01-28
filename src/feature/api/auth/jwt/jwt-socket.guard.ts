// auth.guard.ts

import { AuthService } from '../auth.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class JwtSocketGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const bearerToken = context
      .getArgs()[0]
      .handshake.auth?.Authorization?.split(' ')[1];
    return (await this.authService.verifySocket(bearerToken)) ? true : false;
  }
}
