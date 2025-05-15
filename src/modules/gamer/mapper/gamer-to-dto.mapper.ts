// Legacy Deo Arena support
/* eslint-disable camelcase */
import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { GamerDto } from '../dto/gamer-dto';
import { Gamer } from '../entity/gamer.entity';

export class GamerToDtoMapper extends BaseDtoMapper<Gamer, GamerDto> {
  toDto(entity: Gamer & { isInActiveGame?: boolean }): GamerDto {
    const {
      username,
      accountId,
      referralCode,
      referralUsed,
      referralUserId,
      reservedChips,
      points,
      partyCount,
    } = entity;

    return {
      username,
      account_id: accountId,
      referral_code: referralCode,
      referral_used: referralUsed,
      referral_user_id: referralUserId,
      reservedChips,
      points,
      party: partyCount,
      isInActiveGame: entity.isInActiveGame,
    };
  }
}
