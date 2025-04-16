import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameOverLog } from './entity/game-over-log.entity';
import { GameOverLogService } from './game-over-log.service';
import { ChipsModule } from '../chips/chip.module';
import { GamerModule } from '../gamer/gamer.module';
import { GameOverIndividualLog } from './entity/game-over-individual-log.entity';

@Module({
  imports: [
    ChipsModule,
    GamerModule,
    TypeOrmModule.forFeature([GameOverLog, GameOverIndividualLog], 'pg'),
  ],
  controllers: [],
  providers: [GameOverLogService],
  exports: [GameOverLogService],
})
export class GameOverLogModule {}
