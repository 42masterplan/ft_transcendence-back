import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { MikroOrmModule, logger } from '@mikro-orm/nestjs';
import MikroORMConfig from 'src/configuration/mikro-orm.config';

@Module({
  imports: [ConfigModule, MikroOrmModule.forRoot(MikroORMConfig)],
  providers: [DatabaseService],
})
export class DatabaseModule {}
