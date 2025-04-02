import { GameOverLogType } from 'src/modules/game-over-log/entity/game-over-log.entity';

export interface GameOverLogDto {
  gameId: string;
  type: GameOverLogType;
  typeId: number;
  userId: number;
  gameChips: number;
  perc: number;
  totalPerc: number;
  gamersCount: number;
  winnersCount: number;
  points: number;
  kills: number;
  deaths: number;
  headshots: number;
}
