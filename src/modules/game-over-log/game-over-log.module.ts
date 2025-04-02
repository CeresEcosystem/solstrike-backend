import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameOverLog } from './entity/game-over-log.entity';
import { GameOverLogService } from './game-over-log.service';
import { ChipModule } from '../chips/chip.module';
import { GamerModule } from '../gamer/gamer.module';
import { GameOverIndividualLog } from './entity/game-over-individual-log.entity';

@Module({
  imports: [
    ChipModule,
    GamerModule,
    TypeOrmModule.forFeature([GameOverLog, GameOverIndividualLog], 'pg'),
  ],
  controllers: [],
  providers: [GameOverLogService],
  exports: [GameOverLogService],
})
export class GameOverLogModule {}
