import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { TwoFactorAuthUseCase } from './application/use-case/two-factor-auth.use-case';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt/jwt-auth.strategy';
import { JwtEmailStrategy } from './jwt/jwt-email.strategy';
import { JwtRegisterStrategy } from './jwt/jwt-register.strategy';
import { JwtSignInStrategy } from './jwt/jwt-sign-in.strategy';
import { AuthController } from './presentation/controller/auth.controller';
import { TwoFactorAuthController } from './presentation/controller/two-factor-auth.controller';
import { Module, forwardRef } from '@nestjs/common';
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
    forwardRef(() => UsersModule),
    MailModule,
  ],
  controllers: [AuthController, TwoFactorAuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtEmailStrategy,
    JwtRegisterStrategy,
    JwtSignInStrategy,
    TwoFactorAuthUseCase,
  ],
  exports: [AuthService, TwoFactorAuthUseCase],
})
export class AuthModule {}
