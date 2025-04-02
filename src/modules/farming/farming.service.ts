import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, of, retry } from 'rxjs';
import {
  DEO_ADDRESS,
  DEO_SUPPLY_URL,
  HMX_ADDRESS,
  PAIRS_URL,
  PRICES_URL,
  XOR_ADDRESS,
} from './farming.constants';
import { FarmDto } from './dto/farm.dto';
import { UserDataDto } from './dto/user-data.dto';
import { StakeDto } from './dto/stake.dto';
import { TokenInfoDto } from './dto/token-info.dto';
import { PairDto } from './dto/pair.dto';
import { TokenPriceDto } from './dto/token-price.dto';
import { SupplyDataDto } from './dto/supply-data.dto';
import { FarmDataDto } from './dto/farm-data.dto';
import { BurningService } from '../burning/burning.service';
import { AccountIdValidator } from 'src/utils/validators/account-id.validator';
import { TokenInfoBcDto } from './dto/token-info-bc.dto';
import { PoolInfoBcDto } from './dto/pool-info-bc.dto';
import { FPNumber } from '@sora-substrate/math';
import { UserInfoBcDto } from './dto/user-info-bc.dto';
import { SoraClient } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class FarmingService {
  private readonly logger = new Logger(FarmingService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly burningService: BurningService,
    private readonly soraClient: SoraClient,
    private readonly accountIdValidator: AccountIdValidator,
  ) {}

  public async getFarms(accountId?: string): Promise<FarmDto[]> {
    await this.validateAccountId(accountId);

    const soraApi = await this.soraClient.getSoraApi();
    const demeterPools =
      await soraApi.query.demeterFarmingPlatform.pools.entries();

    const results = await Promise.all(
      demeterPools.map(async (poolData) => {
        const [keys, poolsRaw] = poolData;

        const poolAsset = keys.toHuman()[0].code as string;
        const rewardAsset = keys.toHuman()[1].code as string;
        const tokenDataRaw =
          await soraApi.query.demeterFarmingPlatform.tokenInfos(rewardAsset);
        const tokenData = tokenDataRaw.toHuman() as unknown as TokenInfoBcDto;

        const pools = poolsRaw.toHuman() as unknown as PoolInfoBcDto[];
        const farmPools = pools.filter((pool) => pool.isFarm);

        return this.parseFarmPools(
          farmPools,
          tokenData,
          rewardAsset,
          poolAsset,
          accountId,
        );
      }),
    );

    return results.flat();
  }

  public async getStakings(accountId?: string): Promise<StakeDto[]> {
    await this.validateAccountId(accountId);

    const soraApi = await this.soraClient.getSoraApi();
    const demeterPools =
      await soraApi.query.demeterFarmingPlatform.pools.entries();

    const results = await Promise.all(
      demeterPools.map(async (poolData) => {
        const [keys, poolsRaw] = poolData;

        const poolAsset = keys.toHuman()[0].code as string;
        const rewardAsset = keys.toHuman()[1].code as string;
        const tokenDataRaw =
          await soraApi.query.demeterFarmingPlatform.tokenInfos(rewardAsset);
        const tokenData = tokenDataRaw.toHuman() as unknown as TokenInfoBcDto;
        const stakingTotalMultiplier = Number(tokenData.stakingTotalMultiplier);

        const { pooledTokens, rewards } = await this.getUsersData(
          accountId,
          poolAsset,
          poolAsset,
          rewardAsset,
          false,
        );

        const pools = poolsRaw.toHuman() as unknown as PoolInfoBcDto[];
        const stakingPools = pools.filter((pool) => !pool.isFarm);

        return stakingPools.map((pool) => {
          const multiplier = Number(pool.multiplier);
          const multiplierPercent = Number(
            ((multiplier * 100) / stakingTotalMultiplier).toFixed(4),
          );

          return {
            depositFee: this.toNumber(pool.depositFee) * 100,
            isCore: pool.isCore,
            isRemoved: pool.isRemoved,
            multiplier,
            multiplierPercent,
            poolAsset,
            pooledTokens,
            rewardAsset,
            rewards,
            totalStaked: this.toNumber(pool.totalTokensInPool),
          };
        });
      }),
    );

    return results.flat();
  }

  public async getUsersData(
    accountId: string,
    baseAsset: string,
    poolAsset: string,
    rewardAsset: string,
    isFarm: boolean,
  ): Promise<UserDataDto> {
    if (!accountId || accountId === '') {
      return { rewards: 0, pooledTokens: 0 };
    }

    const soraApi = await this.soraClient.getSoraApi();
    const userInfos = (
      await soraApi.query.demeterFarmingPlatform.userInfos(accountId)
    ).toHuman() as unknown as UserInfoBcDto[];

    const userInfo = userInfos
      .filter((userInfo) => userInfo.baseAsset.code === baseAsset)
      .filter((userInfo) => userInfo.poolAsset.code === poolAsset)
      .filter((userInfo) => userInfo.rewardAsset.code === rewardAsset)
      .find((userInfo) => userInfo.isFarm === isFarm);

    return userInfo
      ? {
          rewards: this.toNumber(userInfo.rewards),
          pooledTokens: this.toNumber(userInfo.pooledTokens),
        }
      : { rewards: 0, pooledTokens: 0 };
  }

  public async getTokensInfos(): Promise<Map<string, TokenInfoDto>> {
    const tokenInfos = new Map<string, TokenInfoDto>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();
    const tokens =
      await soraApi.query.demeterFarmingPlatform.tokenInfos.entries();

    for (let [assetId, tokenInfo] of tokens) {
      assetId = assetId.toHuman()[0].code;
      tokenInfo = tokenInfo.toHuman();
      tokenInfos[assetId] = {
        tokenPerBlock: tokenInfo.tokenPerBlock,
        farmsAllocation: tokenInfo.farmsAllocation,
        stakingAllocation: tokenInfo.stakingAllocation,
      };
    }

    return tokenInfos;
  }

  public async getSupplyData(): Promise<SupplyDataDto> {
    const deoBurned = await this.burningService.getDeoBurned();
    const tvl = await this.getTVL(false);
    const currentSupply = await this.sendGetRequest<number>(DEO_SUPPLY_URL);

    return {
      maxSupply: 10000000,
      currentSupply,
      tvl,
      burned: deoBurned,
    };
  }

  public getHermesTVL(): Promise<number> {
    return this.getTVL(true);
  }

  public async getFarmingPoolsData(): Promise<FarmDataDto[]> {
    const result = [];
    const farms = await this.getFarms();
    const pairs = await this.sendGetRequest<PairDto[]>(PAIRS_URL);
    const tokens = await this.sendGetRequest<TokenPriceDto[]>(PRICES_URL);

    let id = 0;
    for (const farm of farms) {
      if (farm.isRemoved) {
        continue;
      }

      const pair = pairs.find(
        (p) =>
          p.baseAssetId === farm.baseAssetId &&
          p.tokenAssetId === farm.poolAsset,
      );
      const rewardToken = tokens.find((t) => t.assetId === farm.rewardAsset);

      // TVL
      const tvl = farm.tvlPercent * (pair.liquidity / 100);

      // APR
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const soraApi: any = await this.soraClient.getSoraApi();
      let tokenInfo = await soraApi.query.demeterFarmingPlatform.tokenInfos(
        rewardToken.assetId,
      );
      tokenInfo = tokenInfo.toHuman();
      const tokenPerBlock = this.toNumber(tokenInfo.tokenPerBlock);
      const farmsAllocation = this.toNumber(tokenInfo.farmsAllocation);

      const apr =
        ((tokenPerBlock *
          farmsAllocation *
          5256000 *
          (farm.multiplierPercent / 100) *
          Number(rewardToken.price)) /
          tvl) *
        100;
      const tokensPerDay = tokenPerBlock * 14400;

      id += 1;
      const data = {
        id,
        underlyingAssetName: `${farm.baseAsset}-${pair.token} LP`,
        tvl: parseInt(tvl.toFixed()),
        apr: parseFloat(apr.toFixed(2)),
        depositFeeInPercent: farm.depositFee,
        rewardToken: rewardToken.token,
        rewardTokenPerDay: tokensPerDay,
        rewardTokenPrice: rewardToken.price,
      };

      result.push(data);
    }

    result.sort((a, b) => b.apr - a.apr);

    return result;
  }

  private parseFarmPools(
    farmPools: PoolInfoBcDto[],
    tokenData: TokenInfoBcDto,
    rewardAsset: string,
    poolAsset: string,
    accountId: string,
  ): Promise<FarmDto[]> {
    return Promise.all(
      farmPools.map(async (poolData) => {
        const baseAssetId = poolData.baseAsset.code;
        const multiplier = Number(poolData.multiplier);
        const farmsTotalMultiplier = Number(tokenData.farmsTotalMultiplier);
        const multiplierPercent = Number(
          rewardAsset === DEO_ADDRESS
            ? ((multiplier * 100) / 85).toFixed(4)
            : ((multiplier * 100) / farmsTotalMultiplier).toFixed(4),
        );

        const tvlPercent = await this.getPoolTvlPercent(
          baseAssetId,
          poolAsset,
          poolData,
        );

        const { pooledTokens, rewards } = await this.getUsersData(
          accountId,
          baseAssetId,
          poolAsset,
          rewardAsset,
          true,
        );

        return {
          baseAsset: baseAssetId === XOR_ADDRESS ? 'XOR' : 'XSTUSD',
          baseAssetId,
          depositFee: this.toNumber(poolData.depositFee) * 100,
          isCore: poolData.isCore,
          isRemoved: poolData.isRemoved,
          multiplier,
          multiplierPercent,
          poolAsset,
          pooledTokens,
          rewardAsset,
          rewards,
          tvlPercent,
        };
      }),
    );
  }

  private async getPoolTvlPercent(
    baseAssetId: string,
    poolAsset: string,
    poolData: PoolInfoBcDto,
  ): Promise<number> {
    const soraApi = await this.soraClient.getSoraApi();

    const [poolAccount] = (
      await soraApi.query.poolXYK.properties(baseAssetId, poolAsset)
    ).toHuman() as Array<string>;

    const totalIssuanceRaw =
      await soraApi.query.poolXYK.totalIssuances(poolAccount);
    const totalIssuance = this.toNumber(totalIssuanceRaw.toHuman() as string);
    const poolTokens = this.toNumber(poolData.totalTokensInPool);

    return Number(((poolTokens / totalIssuance) * 100).toFixed(2));
  }

  private async getTVL(isHermes: boolean): Promise<number> {
    const farmsTvl = await this.calculateFarmsTvl(isHermes);
    const stakingsTvl = await this.calculateStakingsTvl(isHermes);

    return farmsTvl + stakingsTvl;
  }

  private async calculateFarmsTvl(isHermes: boolean): Promise<number> {
    const pairs = await this.sendGetRequest<PairDto[]>(PAIRS_URL);
    const pairsMap = new Map<
      string,
      { liquidity: number; baseAsset: string }
    >();

    for (const pair of pairs) {
      if (pair.liquidity !== null && pair.tokenAssetId !== XOR_ADDRESS) {
        if (pairsMap[pair.tokenAssetId] === undefined) {
          pairsMap[pair.tokenAssetId] = [];
        }
        pairsMap[pair.tokenAssetId].push({
          liquidity: pair.liquidity,
          baseAsset: pair.baseAssetId,
        });
      }
    }

    let tvl = 0;
    const farms = await this.getFarms();

    for (const farm of farms) {
      if (!isHermes && farm.isRemoved) {
        continue;
      }
      if (isHermes && farm.poolAsset !== HMX_ADDRESS) {
        continue;
      }
      const tokensData = pairsMap[farm.poolAsset];

      for (const td of tokensData) {
        if (td.liquidity !== null && td.baseAsset === farm.baseAssetId) {
          tvl += (farm.tvlPercent / 100) * td.liquidity;
        }
      }
    }

    return tvl;
  }

  private async calculateStakingsTvl(isHermes: boolean): Promise<number> {
    const prices = await this.sendGetRequest<TokenPriceDto[]>(PRICES_URL);
    const tokensMap = new Map<string, number>();

    for (const tkn of prices) {
      tokensMap[tkn.assetId] = tkn.price;
    }

    let tvl = 0;
    const pools = await this.getStakings();

    for (const pool of pools) {
      if (!isHermes && pool.isRemoved) {
        continue;
      }
      if (isHermes && pool.poolAsset !== HMX_ADDRESS) {
        continue;
      }

      const price = parseFloat(tokensMap[pool.poolAsset]);
      tvl += pool.totalStaked * price;
    }

    return tvl;
  }

  private toNumber(strNumber: string): number {
    return FPNumber.fromCodecValue(strNumber).toNumber();
  }

  private async validateAccountId(accountId?: string): Promise<void> {
    if (!accountId || accountId === '') {
      return;
    }

    const isValid = await this.accountIdValidator.validate(accountId);

    if (!isValid) {
      throw new BadRequestException(this.accountIdValidator.defaultMessage());
    }
  }

  // Move to Tools Client
  private async sendGetRequest<T>(url: string): Promise<T> {
    const { data } = await firstValueFrom(
      this.httpService.get<T>(url, { timeout: 3000 }).pipe(
        retry({ count: 5, delay: 1000 }),
        catchError((error: AxiosError) => {
          if (error.response && error.response.status === 404) {
            return of({ data: undefined });
          }
          this.logError(error, url);
          throw new BadGatewayException('API unreachable.');
        }),
      ),
    );

    return data;
  }

  private logError(error: AxiosError, url: string): void {
    this.logger.error(
      `An error happened while contacting api! 
       msg: ${error.message}, code: ${error.code}, cause: ${error.cause}, url: ${url}`,
    );
  }
}
