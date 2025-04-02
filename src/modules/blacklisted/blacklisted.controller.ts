import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BlacklistedService } from './blacklisted.service';
import { BlacklistedAccountDto } from './dto/blacklisted.dto';
import { UpsertBlacklistedAccountDto } from './dto/upsert-blacklisted.dto';
import { BlacklistedToDtoMapper } from './mapper/entity-to-dto.mapper';
import {
  AuthGuard,
  PageDto,
  PageOptionsDto,
  Role,
  Roles,
  RolesGuard,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Controller('blacklisted')
@ApiTags('Blacklisted', 'Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class BlacklistedController {
  constructor(
    private readonly blacklistedService: BlacklistedService,
    private readonly mapper: BlacklistedToDtoMapper,
  ) {}

  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  public getAll(
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageDto<BlacklistedAccountDto>> {
    return this.blacklistedService.findAll(pageOptions);
  }

  @Post()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  public create(
    @Body() blacklistedAccountDto: UpsertBlacklistedAccountDto,
  ): Promise<BlacklistedAccountDto> {
    return this.mapper.toDtoAsync(
      this.blacklistedService.create(blacklistedAccountDto),
    );
  }

  @Put(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  public update(
    @Param('id') id: string,
    @Body() blacklistedAccountDto: UpsertBlacklistedAccountDto,
  ): Promise<void> {
    return this.blacklistedService.update(id, blacklistedAccountDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  public delete(@Param('id') id: string): Promise<void> {
    return this.blacklistedService.delete(id);
  }
}
