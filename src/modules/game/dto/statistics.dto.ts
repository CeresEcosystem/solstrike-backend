export class StatisticsDto {
  games: GamesStatisticsDto;
  players: PlayersStatisticsDto;
}

export class GamesStatisticsDto {
  countToday: number;
  countTotal: number;
  countInProgress: number;
}

export class PlayersStatisticsDto {
  countToday: number;
  countTotal: number;
  countInProgress: number;
}
