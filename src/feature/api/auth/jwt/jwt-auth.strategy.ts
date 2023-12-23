import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../presentation/jwt-payload.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.AUTH_JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<JwtPayload> {
    if (!payload.sub) throw new UnauthorizedException('IntraId Required');
    const user = await this.usersService.findOneByIntraId(payload.sub);
    if (!user) throw new UnauthorizedException('IntraId Required');
    if (user.name == null)
      throw new UnauthorizedException('Registration Required');
    if (user.email === null || (user.email !== null && !user.isEmailValidated))
      throw new UnauthorizedException('Email Required');
    if (user.is2faEnabled && !user.is2faValidated)
      throw new UnauthorizedException('2FA Required');
    return { sub: payload.sub };
  }
}
