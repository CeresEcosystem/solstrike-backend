import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BurningService } from './burning.service';
import { BurnChipsDto } from './dto/burn-chips.dto';
import { BurnLogDto } from './dto/burn-log.dto';
import { SetDeoBurnedDto } from './dto/set-deo-burned.dto';
import { DeoBurnedDto } from './dto/deo-burned.dto';
import {
  AuthGuard,
  Roles,
  Role,
  RolesGuard,
  PageOptionsDto,
  PageDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Controller('burn')
@ApiTags('Burning', 'Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class BurningController {
  constructor(private readonly burningService: BurningService) {}

  @Get('total')
  @Roles(Role.Admin, Role.Arena)
  @UseGuards(RolesGuard)
  public getTotal(): Promise<number> {
    return this.burningService.getTotalBurned();
  }

  @Get('logs')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  public getBurnLogs(
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageDto<BurnLogDto>> {
    return this.burningService.getBurnLogs(pageOptions);
  }

  @Post()
  @Roles(Role.Admin, Role.Arena)
  @UseGuards(RolesGuard)
  public burnChips(@Body() burnChipsDto: BurnChipsDto): Promise<number> {
    return this.burningService.burnChips(burnChipsDto.amount);
  }

  @Get('deo')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  public async getDeoBurned(): Promise<DeoBurnedDto> {
    return {
      amount: await this.burningService.getDeoBurned(),
    };
  }

  @Put('deo')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  public updateDeoBurned(@Body() deoBurnedDto: SetDeoBurnedDto): Promise<void> {
    return this.burningService.updateDeoBurned(deoBurnedDto.amount);
  }
}
