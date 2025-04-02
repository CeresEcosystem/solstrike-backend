import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SeasonsService } from './seasons.service';
import { SeasonDto } from './dto/season.dto';
import { CloseSeasonDto } from './dto/close-season.dto';
import type { Response } from 'express';
import { Readable } from 'stream';
import {
  AuthGuard,
  PageDto,
  PageOptionsDto,
  Role,
  Roles,
  RolesGuard,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Controller('seasons')
@ApiTags('Seasons', 'Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  public getAll(
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageDto<SeasonDto>> {
    return this.seasonsService.findAll(pageOptions);
  }

  @Post('current/reset')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  public resetCurrent(): Promise<void> {
    return this.seasonsService.resetCurrent();
  }

  @Post('current/close')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  public closeCurrent(
    @Body() closeSeasonDto: CloseSeasonDto,
  ): Promise<SeasonDto> {
    return this.seasonsService.closeCurrent(closeSeasonDto);
  }

  @Get(':seasonId/csv')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Header('Content-Type', 'application/csv')
  public async exportToCsv(
    @Param('seasonId') seasonId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const [fileName, fileContent] = await this.seasonsService.exportCsv(
      seasonId,
    );

    res.header('Content-Disposition', `attachment; filename="${fileName}"`);

    return new StreamableFile(Readable.from(fileContent));
  }
}
