import { BlacklistedAccount } from '../entity/blacklisted.entity';
import { BlacklistedAccountDto } from '../dto/blacklisted.dto';
import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

export class BlacklistedToDtoMapper extends BaseDtoMapper<
  BlacklistedAccount,
  BlacklistedAccountDto
> {
  toDto(entity: BlacklistedAccount): BlacklistedAccountDto {
    const { id, username, accountId } = entity;

    return {
      id,
      username,
      accountId,
    };
  }
}
