import { Logger } from '@nestjs/common';
import { Options } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

const logger = new Logger('MikroORM');
const MikroORMConfig: Options = {
  dbName: configService.get('POSTGRES_DATABASE'),
  user: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  host: configService.get('POSTGRES_HOST'),
  port: configService.get('POSTGRES_PORT'),
  type: 'postgresql',
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  highlighter: new SqlHighlighter(),
  // migrations: {
  //   path: './src/database/migrations',
  // },
  logger: logger.log.bind(logger),
};

export default MikroORMConfig;
