import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { GameOverLog } from '../game-over-log/entity/game-over-log.entity';
import { BurnLogDto } from './dto/burn-log.dto';

export class LogToDtoMapper extends BaseDtoMapper<GameOverLog, BurnLogDto> {
  toDto(entity: GameOverLog): BurnLogDto {
    const { gameId, gameChips, perc, createdAt } = entity;

    return {
      gameUuid: gameId,
      gameChips,
      perc,
      createdAt,
    };
  }
}
