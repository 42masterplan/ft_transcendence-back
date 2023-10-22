import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import MicroORMConfig from 'src/configuration/database.config';

@Module({
  imports: [
    MikroOrmModule.forRoot(
      MicroORMConfig,
      // dbName: configService.get('POSTGRES_DB'),
      // user: configService.get('POSTGRES_USER'),
      // password: configService.get('POSTGRES_PASSWORD'),
      // host: configService.get('POSTGRES_HOST'),
      // port: configService.get('POSTGRES_PORT'),
      // type: 'postgresql',
      // autoLoadEntities: true,
      // entities: [Address],
      // flushMode: FlushMode.COMMIT,
      // debug: configService.get('SHOULD_DEBUG_SQL'),
    ),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
