import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt/jwt-auth.strategy';
import { JwtEmailStrategy } from './jwt/jwt-email.strategy';
import { JwtRegisterStrategy } from './jwt/jwt-register.strategy';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('AUTH_JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtEmailStrategy, JwtRegisterStrategy],
})
export class AuthModule {}
