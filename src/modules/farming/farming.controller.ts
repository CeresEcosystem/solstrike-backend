import {
  Controller,
  Get,
  Inject,
  ParseBoolPipe,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FarmingService } from './farming.service';
import { FarmDto } from './dto/farm.dto';
import { StakeDto } from './dto/stake.dto';
import { UserDataDto } from './dto/user-data.dto';
import { TokenInfoDto } from './dto/token-info.dto';
import { SupplyDataDto } from './dto/supply-data.dto';
import { FarmDataDto } from './dto/farm-data.dto';
import { Cache } from 'cache-manager';
import { CACHE_KEYS, CACHE_TTL } from './farming.constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Controller('demeter')
@ApiTags('Demeter')
export class FarmingController {
  constructor(
    private readonly farmingService: FarmingService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Get('farms')
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account Id. Optional',
    required: false,
  })
  public getFarms(@Query('accountId') accountId?: string): Promise<FarmDto[]> {
    return this.farmingService.getFarms(accountId);
  }

  @Get('stakings')
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account Id. Optional',
    required: false,
  })
  public getStakings(
    @Query('accountId') accountId?: string,
  ): Promise<StakeDto[]> {
    return this.farmingService.getStakings(accountId);
  }

  @Get('users-data')
  public getUsersData(
    @Query('accountId') accountId: string,
    @Query('baseAsset') baseAsset: string,
    @Query('poolAsset') poolAsset: string,
    @Query('rewardAsset') rewardAsset: string,
    @Query('isFarm', new ParseBoolPipe()) isFarm: boolean,
  ): Promise<UserDataDto> {
    return this.farmingService.getUsersData(
      accountId,
      baseAsset,
      poolAsset,
      rewardAsset,
      isFarm,
    );
  }

  @Get('tokens-infos')
  public getTokensInfos(): Promise<Map<string, TokenInfoDto>> {
    return this.farmingService.getTokensInfos();
  }

  @Get('supply-data')
  public getSupplyData(): Promise<SupplyDataDto> {
    return this.cacheManager.wrap(
      CACHE_KEYS.SUPPLY_DATA,
      () => this.farmingService.getSupplyData(),
      CACHE_TTL.ONE_MINUTE,
    );
  }

  @Get('hermes-tvl')
  public getHermesTVL(): Promise<number> {
    return this.cacheManager.wrap(
      CACHE_KEYS.HERMES_TVL,
      () => this.farmingService.getHermesTVL(),
      CACHE_TTL.ONE_MINUTE,
    );
  }

  @Get('farming-data')
  public getFarmingPoolsData(): Promise<FarmDataDto[]> {
    return this.farmingService.getFarmingPoolsData();
  }
}
