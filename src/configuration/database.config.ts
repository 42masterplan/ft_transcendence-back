import { Logger } from '@nestjs/common';
import { Options } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

const logger = new Logger('MikroORM');
const MicroORMConfig: Options = {
  dbName: './tmp/data.postgresql',
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  type: 'postgresql',
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  debug: true,
  highlighter: new SqlHighlighter(),
  // migrations: {
  //   path: './src/database/migrations',
  // },
  logger: logger.log.bind(logger),
};

export default MicroORMConfig;
