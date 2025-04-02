import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeasonsService } from './seasons.service';
import { SeasonsController } from './seasons.controller';
import { Season } from './entity/season.entity';
import { SeasonToDtoMapper } from './mapper/season-to-dto.mapper';
import { GamerModule } from '../gamer/gamer.module';
import { Ranking } from './entity/ranking.entity';
import { RankingToLeaderboardDtoMapper } from './mapper/ranking-to-leaderboard-dto.mapper';
import { AuthModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [
    AuthModule,
    GamerModule,
    TypeOrmModule.forFeature([Season, Ranking], 'pg'),
  ],
  controllers: [SeasonsController],
  providers: [SeasonsService, SeasonToDtoMapper, RankingToLeaderboardDtoMapper],
  exports: [],
})
export class SeasonsModule {}
