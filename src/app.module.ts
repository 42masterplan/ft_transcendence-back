import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './feature/database/database.module';
import { ApiModule } from './feature/api/api.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    ApiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'develop' ? '.env.develop' : '.env.production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
