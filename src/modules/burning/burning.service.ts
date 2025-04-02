import { BadRequestException, Injectable } from '@nestjs/common';
import { Big } from 'big.js';
import { randomUUID } from 'crypto';
import { GameOverLogService } from '../game-over-log/game-over-log.service';
import { KeyValueData } from './entity/key-value-data.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BurnLogDto } from './dto/burn-log.dto';
import { LogToDtoMapper } from './burn-log-to-dto.mapper';
import {
  PageDto,
  PageOptionsDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

const GAME_OVER_LOG_TYPE_BURN = 'burn';
const DEO_BURNED_DB_KEY = 'deo-burned';

@Injectable()
export class BurningService {
  constructor(
    @InjectRepository(KeyValueData)
    private readonly keyValueRepo: Repository<KeyValueData>,
    private readonly gameOverLogService: GameOverLogService,
    private readonly logToDtoMapper: LogToDtoMapper,
  ) {}

  public getTotalBurned(): Promise<number> {
    return this.gameOverLogService.getTotalChipsByType(GAME_OVER_LOG_TYPE_BURN);
  }

  public async getBurnLogs(
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<BurnLogDto>> {
    const { data, meta } = await this.gameOverLogService.getByType(
      GAME_OVER_LOG_TYPE_BURN,
      pageOptions,
    );

    const logDtos = this.logToDtoMapper.toDtos(data);

    return new PageDto(logDtos, meta);
  }

  public async burnChips(amount: number): Promise<number> {
    const total = await this.getTotalBurned();

    this.validateAmount(total, amount);

    const perc = this.calcPercentage(total, amount);

    await this.gameOverLogService.insertBurnLog({
      gameUuid: randomUUID(),
      gameChips: -amount,
      perc,
      totalPerc: perc,
    });

    return this.getTotalBurned();
  }

  public async getDeoBurned(): Promise<number> {
    const deoBurned = await this.keyValueRepo.findOneBy({
      id: DEO_BURNED_DB_KEY,
    });

    return deoBurned ? Number(deoBurned.value) : 0;
  }

  public async updateDeoBurned(deoBurned: number): Promise<void> {
    const existingValue = await this.keyValueRepo.findOneBy({
      id: DEO_BURNED_DB_KEY,
    });

    if (existingValue) {
      await this.keyValueRepo.update(
        { id: DEO_BURNED_DB_KEY },
        {
          value: String(deoBurned),
          updatedAt: new Date(),
        },
      );

      return;
    }

    await this.keyValueRepo.insert({
      id: DEO_BURNED_DB_KEY,
      value: String(deoBurned),
      updatedAt: new Date(),
    });
  }

  private validateAmount(total: number, amount: number): void {
    if (total < amount) {
      throw new BadRequestException(
        'Current total amount is less than input amount.',
      );
    }
  }

  private calcPercentage(total: number, amount: number): number {
    return total === 0 ? 100 : new Big(amount).div(total).mul(100).toNumber();
  }
}
