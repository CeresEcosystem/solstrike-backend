import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HoldersModule } from './modules/holders/holders.module';
import { BurningModule } from './modules/burning/burning.module';
import { GamerModule } from './modules/gamer/gamer.module';
import { BlacklistedModule } from './modules/blacklisted/blacklisted.module';
import { ChipModule } from './modules/chips/chip.module';
import { GameModule } from './modules/game/game.module';
import { FarmingModule } from './modules/farming/farming.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { SeasonsModule } from './modules/seasons/seasons.module';
import { TelegramLoggerModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { CacheModule } from '@nestjs/cache-manager';
import { FeesModule } from './modules/fees/fees.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    NestjsFormDataModule.config({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      autoLoadEntities: true,
      replication: {
        master: {
          host: process.env.MYSQL_HOST,
          port: Number(process.env.MYSQL_PORT),
          username: process.env.MYSQL_USER,
          password: process.env.MYSQL_PASSWORD,
          database: process.env.MYSQL_DB_NAME,
        },
        slaves: [
          {
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT),
            username: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB_NAME,
          },
          // {
          //   host: process.env.MYSQL_SLAVE_HOST,
          //   port: Number(process.env.MYSQL_SLAVE_PORT),
          //   username: process.env.MYSQL_SLAVE_USER,
          //   password: process.env.MYSQL_SLAVE_PASSWORD,
          //   database: process.env.MYSQL_SLAVE_DB_NAME,
          // },
        ],
      },
    }),
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
    HoldersModule,
    BurningModule,
    GamerModule,
    BlacklistedModule,
    ChipModule,
    GameModule,
    FarmingModule,
    SeasonsModule,
    FeesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
