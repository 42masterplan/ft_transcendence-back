import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { MikroOrmModule, logger } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dbName: configService.get('POSTGRES_DATABASE'),
        user: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        type: 'postgresql',
        autoLoadEntities: true,
        entities: ['./dist/**/*.entity.js'],
        entitiesTs: ['./src/**/*.entity.ts'],
        highlighter: new SqlHighlighter(),
        logger: logger.log.bind(logger),
        // flushMode: FlushMode.COMMIT,
        // debug: configService.get('SHOULD_DEBUG_SQL'),
      }),
    }),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
