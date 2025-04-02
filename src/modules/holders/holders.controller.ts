import { CACHE_KEYS, CACHE_TTL } from './holders.constants';
import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { HoldersService } from './holders.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Controller('holders')
@ApiTags('Holders')
export class HoldersController {
  constructor(
    private readonly holdersService: HoldersService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Get('count')
  public getHoldersCount(): Promise<number> {
    return this.cacheManager.wrap(
      CACHE_KEYS.DEO_HOLDERS,
      () => this.holdersService.getHoldersCount(),
      CACHE_TTL.ONE_HOUR,
    );
  }
}
