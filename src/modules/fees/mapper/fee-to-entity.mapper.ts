import { BaseEntityMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { Fee } from '../entity/fee.entity';
import { FeeBcDto } from '../dto/fee-bc.dto';

export class FeeToEntityMapper extends BaseEntityMapper<Fee, FeeBcDto> {
  toEntity(dto: FeeBcDto): Fee {
    const { type, fee } = dto;

    return {
      type,
      fee,
    } as Fee;
  }
}
