import { Ranking } from '../entity/ranking.entity';
import { LeaderboardDto } from '../dto/leaderboard-dto';
import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

export class RankingToLeaderboardDtoMapper extends BaseDtoMapper<
  Ranking,
  LeaderboardDto
> {
  toDto(entity: Ranking): LeaderboardDto {
    const {
      gamer: { accountId, username },
      place,
      points,
      partyCount,
      kills,
      deaths,
      headshots,
    } = entity;

    return {
      accountId,
      username: username || accountId,
      place,
      points,
      partyCount,
      kills,
      deaths,
      headshots,
    };
  }
}
