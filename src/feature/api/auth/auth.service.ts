import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload } from './presentation/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async getAccessToken(code: string): Promise<string> {
    const requestUrl = `https://api.intra.42.fr/oauth/token?grant_type=authorization_code&client_id=${process.env.AUTH_CLIENT_ID}&client_secret=${process.env.AUTH_CLIENT_SECRET}&code=${code}&redirect_uri=${process.env.AUTH_REDIRECT_URL}`;

    let res;
    try {
      res = await fetch(requestUrl, { method: 'post' });
    } catch (err) {
      throw new InternalServerErrorException(
        err,
        'Access Token을 받아오는 중 문제가 발생했습니다.',
      );
    }
    if (res.status >= 400 && res.status < 500)
      throw new UnauthorizedException('Access Token을 받아올 수 없습니다.');
    else if (res.status > 500)
      throw new InternalServerErrorException(
        '42 Auth 시스템에 문제가 발생했습니다.',
      );
    try {
      const data = await res.json();
      return data.access_token;
    } catch (err) {
      throw new InternalServerErrorException(
        err,
        '응답에서 data를 받아오는 중 문제가 발생했습니다.',
      );
    }
  }

  async getUserIntraId(accessToken: string): Promise<string> {
    const requestUrl = 'https://api.intra.42.fr/v2/me';

    let res;
    try {
      res = await fetch(requestUrl, {
        method: 'get',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        err,
        '사용자 데이터를 가져오는 중 문제가 발생했습니다.',
      );
    }
    if (res.status >= 400 && res.status < 500)
      throw new UnauthorizedException(
        '사용자 데이터를 가져올 권한이 없습니다.',
      );
    else if (res.status > 500)
      throw new InternalServerErrorException(
        '42 Auth 시스템에 문제가 발생했습니다.',
      );
    try {
      const data = await res.json();
      return data.login;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getJwtToken(intraId: string): Promise<string> {
    const payload: JwtPayload = { sub: intraId };
    const jwtToken = await this.jwtService.signAsync(payload);
    return jwtToken;
  }
}
