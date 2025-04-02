import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Season } from './entity/season.entity';
import { SeasonDto } from './dto/season.dto';
import { SeasonToDtoMapper } from './mapper/season-to-dto.mapper';
import { GamerService } from '../gamer/gamer.service';
import { CloseSeasonDto } from './dto/close-season.dto';
import { Ranking } from './entity/ranking.entity';
import { RankingToLeaderboardDtoMapper } from './mapper/ranking-to-leaderboard-dto.mapper';
import { LeaderboardDto } from './dto/leaderboard-dto';
import { Parser } from '@json2csv/plainjs';
import { CSV_PARSER_OPTIONS } from './seasons.constants';
import {
  PageOptionsDto,
  PageDto,
  PageMetaDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(Season, 'pg')
    private readonly seasonsRepo: Repository<Season>,
    @InjectRepository(Ranking, 'pg')
    private readonly rankingsRepo: Repository<Ranking>,
    private readonly gamerService: GamerService,
    private readonly seasonToDtoMapper: SeasonToDtoMapper,
    private readonly rankingToLeaderboardMapper: RankingToLeaderboardDtoMapper,
  ) {}

  public async findAll(
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<SeasonDto>> {
    const [data, totalCount] = await this.seasonsRepo.findAndCount({
      skip: pageOptions.skip,
      take: pageOptions.size,
      where: { status: true },
      order: { id: 'DESC' },
    });

    const pageMeta = new PageMetaDto(
      pageOptions.page,
      pageOptions.size,
      totalCount,
    );

    return new PageDto(this.seasonToDtoMapper.toDtos(data), pageMeta);
  }

  public resetCurrent(): Promise<void> {
    return this.gamerService.resetPointsForAll();
  }

  public async closeCurrent(
    closeSeasonDto: CloseSeasonDto,
  ): Promise<SeasonDto> {
    const season = await this.createSeason(closeSeasonDto);

    await this.saveCurrentRanking(season.id);
    await this.resetCurrent();

    return this.seasonToDtoMapper.toDto(season);
  }

  public async exportCsv(seasonId: string): Promise<[string, string]> {
    const season = await this.seasonsRepo.findOneByOrFail({
      id: seasonId,
      status: true,
    });
    const rankings = await this.getLeaderboard(seasonId);

    const parser = new Parser(CSV_PARSER_OPTIONS);
    const csv = parser.parse(rankings);

    const seasonNameNormalized = season.name.replaceAll(' ', '_');
    const fileName = `Season_${seasonId}_${seasonNameNormalized}.csv`;

    return [fileName, csv];
  }

  public async getLeaderboard(seasonId: string): Promise<LeaderboardDto[]> {
    const seasonRanking = await this.rankingsRepo.find({
      where: { seasonId },
      relations: { gamer: true },
      order: { place: 'ASC' },
    });

    return this.rankingToLeaderboardMapper.toDtos(seasonRanking);
  }

  private createSeason(closeSeasonDto: CloseSeasonDto): Promise<Season> {
    return this.seasonsRepo.save({
      ...closeSeasonDto,
      status: true,
    });
  }

  private async saveCurrentRanking(seasonId: string): Promise<void> {
    const gamerRankings = await this.gamerService.getRanking();
    const seasonRankings = gamerRankings.map((ranking) => ({
      ...ranking,
      seasonId,
    }));

    await this.rankingsRepo.save(seasonRankings);
    await this.gamerService.saveGamerLogs(seasonId);
  }
}
