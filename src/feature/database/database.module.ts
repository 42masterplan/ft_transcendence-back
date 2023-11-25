import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import MikroORMConfig from 'src/configuration/mikro-orm.config';
import { DatabaseService } from './database.service';

@Module({
  imports: [ConfigModule, MikroOrmModule.forRoot(MikroORMConfig)],
  providers: [DatabaseService],
})
export class DatabaseModule {}
