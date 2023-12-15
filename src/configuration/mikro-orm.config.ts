import { Options } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { Logger } from '@nestjs/common';
import custom_env from 'custom-env';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
// custom_env.env('develop');
const logger = new Logger('MikroORM');
const MikroORMConfig: Options = {
  // entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
	type: 'postgresql',
	dbName: configService.get('POSTGRES_DATABASE'),
	user: configService.get('POSTGRES_USERNAME'),
	password: configService.get('POSTGRES_PASSWORD'),
	host: configService.get('POSTGRES_HOST'),
	port: configService.get('POSTGRES_PORT'),
  // dbName: process.env.POSTGRES_DATABASE,
  // user: process.env.POSTGRES_USERNAME,
  // password: process.env.POSTGRES_PASSWORD,
  // host: process.env.POSTGRES_HOST,
  // port: parseInt(process.env.POSTGRES_PORT),
	
  debug: true,
  highlighter: new SqlHighlighter(),
  migrations: {
    path: './src/migrations',
  },
  logger: logger.log.bind(logger),
  allowGlobalContext: true,
};

export default MikroORMConfig;
