import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './feature/database/database.module';
import { ApiModule } from './feature/api/api.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
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
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
