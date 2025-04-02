import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { GamerModule } from './modules/gamer/gamer.module';
import { BlacklistedModule } from './modules/blacklisted/blacklisted.module';
import { GameModule } from './modules/game/game.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { SeasonsModule } from './modules/seasons/seasons.module';
import { TelegramLoggerModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    NestjsFormDataModule.config({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      name: 'pg',
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB_NAME,
      autoLoadEntities: true,
    }),
    TelegramLoggerModule,
    GamerModule,
    BlacklistedModule,
    GameModule,
    SeasonsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
