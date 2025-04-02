import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { Fee } from '../entity/fee.entity';
import { FeeDto } from '../dto/fee.dto';

export class FeeToDtoMapper extends BaseDtoMapper<Fee, FeeDto> {
  toDto(entity: Fee): FeeDto {
    const { type, fee, updatedAt } = entity;

    return {
      type,
      fee,
      updatedAt,
    };
  }
}
