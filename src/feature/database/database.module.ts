import { DatabaseService } from './database.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule ,ConfigService} from '@nestjs/config';
import { FlushMode } from '@mikro-orm/core';
import MikroORMConfig from 'src/configuration/mikro-orm.config';

// @Module({
//   imports: [ConfigModule, MikroOrmModule.forRoot(MikroORMConfig)],
//   providers: [DatabaseService],
// })

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dbName: configService.get('POSTGRES_DATABASE'),
        user: configService.get('POSTGRES_USERNAME'),
        password: configService.get('POSTGRES_PASSWORD'),
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        type: 'postgresql',
        autoLoadEntities: true,
        // entities: ['./dist/**/*.entity.js'],
				entitiesTs: ['./src/**/*.entity.ts'],
        flushMode: FlushMode.COMMIT,
				debug: true,
				synchronize: true,
 
      }),
    })
  ],
})
export class DatabaseModule {}
