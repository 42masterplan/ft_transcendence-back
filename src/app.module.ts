import { join } from 'node:path';
import { DatabaseModule } from './feature/database/database.module';
import { AppController } from '@/src/app.controller';
import { AppService } from '@/src/app.service';
import { ApiModule } from '@/src/feature/api/api.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ServeStaticModule } from '@nestjs/serve-static';
import * as Joi from 'joi';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'resources'),
      serveRoot: '/resources',
    }),
    DatabaseModule,
    ApiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'develop' ? '.env.develop' : '.env.production',

      validationSchema: Joi.object({
        PORT: Joi.number().default(8080),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().default(3306),
        POSTGRES_USERNAME: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DATABASE: Joi.string().required(),
        AUTH_CLIENT_ID: Joi.string().required(),
        AUTH_CLIENT_SECRET: Joi.string().required(),
        AUTH_REDIRECT_URL: Joi.string().uri().required(),
        AUTH_JWT_SECRET: Joi.string().required(),
        EMAIL_ADDRESS: Joi.string().email().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        EMAIL_HOST_NAME: Joi.string().required(),
        SERVER_URL: Joi.string().uri().required(),
        SERVER_DOMAIN: Joi.string().required(),
        SERVER_SECRET_KEY: Joi.string().required(),
        SERVER_HASH_KEY: Joi.string().required(),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
