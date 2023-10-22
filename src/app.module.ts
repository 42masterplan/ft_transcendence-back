import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './feature/database/database.module';
import { ApiModule } from './feature/api/api.module';

@Module({
  imports: [DatabaseModule, ApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
