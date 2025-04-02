import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FeesService } from './fees.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CACHE_KEYS, CACHE_TTL } from './fees.constants';
import { FeeToDtoMapper } from './mapper/fee-to-dto.mapper';
import { FeeDto } from './dto/fee.dto';
import { Cache } from 'cache-manager';

@Controller('fees')
@ApiTags('Fees Controller')
export class FeesController {
  constructor(
    private readonly feesService: FeesService,
    private readonly mapper: FeeToDtoMapper,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Get()
  public getFees(): Promise<FeeDto[]> {
    return this.cacheManager.wrap(
      CACHE_KEYS.FEES,
      () => this.mapper.toDtosAsync(this.feesService.getFees()),
      CACHE_TTL.FOUR_HOURS,
    );
  }
}
