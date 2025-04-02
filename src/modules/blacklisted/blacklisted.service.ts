import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BlacklistedAccount } from './entity/blacklisted.entity';
import { BlacklistedAccountDto } from './dto/blacklisted.dto';
import { UpsertBlacklistedAccountDto } from './dto/upsert-blacklisted.dto';
import { BlacklistedToDtoMapper } from './mapper/entity-to-dto.mapper';
import { PageOptionsDto, PageDto, PageMetaDto } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class BlacklistedService {
  constructor(
    @InjectRepository(BlacklistedAccount, 'pg')
    private readonly blacklistedRepo: Repository<BlacklistedAccount>,
    private readonly toDtoMapper: BlacklistedToDtoMapper,
  ) {}

  public isBlacklisted(accountId: string): Promise<boolean> {
    return this.blacklistedRepo.exist({ where: { accountId } });
  }

  public async findAll(
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<BlacklistedAccountDto>> {
    const [data, totalCount] = await this.blacklistedRepo.findAndCount({
      skip: pageOptions.skip,
      take: pageOptions.size,
      order: { createdAt: 'DESC' },
    });

    const pageMeta = new PageMetaDto(
      pageOptions.page,
      pageOptions.size,
      totalCount,
    );

    return new PageDto(this.toDtoMapper.toDtos(data), pageMeta);
  }

  public create(
    blacklistedAccountDto: UpsertBlacklistedAccountDto,
  ): Promise<BlacklistedAccount> {
    return this.blacklistedRepo
      .save(blacklistedAccountDto)
      .catch((error: QueryFailedError) => {
        throw new BadRequestException(error.message);
      });
  }

  public async update(
    id: string,
    blacklistedAccountDto: UpsertBlacklistedAccountDto,
  ): Promise<void> {
    await this.blacklistedRepo
      .update(id, {
        ...blacklistedAccountDto,
        updatedAt: new Date(),
      })
      .catch((error: QueryFailedError) => {
        throw new BadRequestException(error.message);
      });
  }

  public async delete(id: string): Promise<void> {
    await this.blacklistedRepo.delete({ id });
  }
}
