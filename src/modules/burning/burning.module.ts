import { Module } from '@nestjs/common';
import { BurningService } from './burning.service';
import { BurningController } from './burning.controller';
import { GameOverLogModule } from '../game-over-log/game-over-log.module';
import { BurningScheduler } from './burning.scheduler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyValueData } from './entity/key-value-data.entity';
import { LogToDtoMapper } from './burn-log-to-dto.mapper';
import {
  AuthModule,
  SoraClientModule,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [
    AuthModule,
    GameOverLogModule,
    SoraClientModule,
    TypeOrmModule.forFeature([KeyValueData]),
  ],
  controllers: [BurningController],
  providers: [BurningService, BurningScheduler, LogToDtoMapper],
  exports: [BurningService],
})
export class BurningModule {}
