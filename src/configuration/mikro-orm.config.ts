import { Logger } from '@nestjs/common';
import { Options } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import custom_env from 'custom-env';

custom_env.env('develop');

const logger = new Logger('MikroORM');
const MikroORMConfig: Options = {
  dbName: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  type: 'postgresql',
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  debug: true,
  highlighter: new SqlHighlighter(),
  migrations: {
    path: './src/migrations',
  },
  logger: logger.log.bind(logger),
  allowGlobalContext: true,
};

export default MikroORMConfig;
