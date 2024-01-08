import { UsersUseCase } from '../../users/application/use-case/users.use-case';
import { JwtPayload } from '../presentation/jwt-payload.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtSignInStrategy extends PassportStrategy(Strategy, 'signIn') {
  constructor(private readonly usersUseCase: UsersUseCase) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.AUTH_JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<JwtPayload> {
    if (!payload.sub) throw new UnauthorizedException('IntraId Required');
    const user = await this.usersUseCase.findOneByIntraId(payload.sub);
    if (!user) throw new UnauthorizedException('IntraId Required');
    return { sub: payload.sub };
  }
}
