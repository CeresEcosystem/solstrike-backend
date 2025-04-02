import { Season } from '../entity/season.entity';
import { SeasonDto } from '../dto/season.dto';
import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

export class SeasonToDtoMapper extends BaseDtoMapper<Season, SeasonDto> {
  toDto(entity: Season): SeasonDto {
    const { id, name, dateFrom, dateTo } = entity;

    return {
      id,
      name,
      dateFrom,
      dateTo,
    };
  }
}
