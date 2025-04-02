import { Injectable, Logger } from '@nestjs/common';
import { SoraClient } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FeesRepository } from './fees.repository';
import { FPNumber } from '@sora-substrate/math';
import { Codec } from '@sora-substrate/math/node_modules/@polkadot/types-codec/types/codec';
import { Fee } from './entity/fee.entity';
import { FeeToEntityMapper } from './mapper/fee-to-entity.mapper';
import { FeeBcDto } from './dto/fee-bc.dto';
import { FEE_TYPES } from './fees-fee-types.enum';
import {
  ADDRESS,
  AMOUNT,
  BASE_ASSET,
  DENOMINATOR,
  POOL_ASSET,
  REWARD_ASSET,
} from './fees.constants';

@Injectable()
export class FeesService {
  private readonly logger = new Logger(FeesService.name);

  constructor(
    private readonly soraClient: SoraClient,
    private readonly feesRepository: FeesRepository,
    private readonly feeMapper: FeeToEntityMapper,
  ) {}

  public getFees(): Promise<Fee[]> {
    return this.feesRepository.findAll();
  }

  @Cron(CronExpression.EVERY_4_HOURS)
  async fetchFeesFromSora(): Promise<void> {
    const soraApi = await this.soraClient.getSoraApi();

    const [depositFee, rewardsFee, withdrawFee] = await Promise.all([
      soraApi.tx.demeterFarmingPlatform
        .deposit(
          BASE_ASSET,
          POOL_ASSET,
          REWARD_ASSET,
          true,
          FPNumber.fromNatural(AMOUNT).toString(),
        )
        .paymentInfo(ADDRESS)
        .then((info) => info.partialFee as unknown as Codec),
      soraApi.tx.demeterFarmingPlatform
        .getRewards(BASE_ASSET, POOL_ASSET, REWARD_ASSET, true)
        .paymentInfo(ADDRESS)
        .then((info) => info.partialFee as unknown as Codec),
      soraApi.tx.demeterFarmingPlatform
        .withdraw(
          BASE_ASSET,
          POOL_ASSET,
          REWARD_ASSET,
          FPNumber.fromNatural(AMOUNT).toString(),
          true,
        )
        .paymentInfo(ADDRESS)
        .then((info) => info.partialFee as unknown as Codec),
    ]);

    const fees: Fee[] = this.buildFees(depositFee, rewardsFee, withdrawFee);
    await this.feesRepository.upsertAll(fees);

    this.logger.log('Fetching and saving fees was successful!');
  }

  private buildFees(
    depositFee: Codec,
    rewardsFee: Codec,
    withdrawFee: Codec,
  ): Fee[] {
    const feesDto: FeeBcDto[] = [
      {
        type: FEE_TYPES.Deposit,
        fee: new FPNumber(depositFee, DENOMINATOR).toNumber(),
      },
      {
        type: FEE_TYPES.Rewards,
        fee: new FPNumber(rewardsFee, DENOMINATOR).toNumber(),
      },
      {
        type: FEE_TYPES.Withdraw,
        fee: new FPNumber(withdrawFee, DENOMINATOR).toNumber(),
      },
    ];

    return feesDto.map((fee) => this.feeMapper.toEntity(fee));
  }
}
