import { Controller, Get, Body, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChipService } from './chip.service';
import { ChipsAmountDto } from './dto/chips-amount.dto';
import { SetChipsAmountDto } from './dto/set-chips-amount.dto';
import {
  Roles,
  Role,
  RolesGuard,
  AuthGuard,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Controller('chips')
@ApiTags('Chips', 'Admin')
@ApiBearerAuth()
export class ChipController {
  constructor(private readonly chipService: ChipService) {}

  @Get('amount')
  public async getChipAmount(): Promise<ChipsAmountDto> {
    const amount = await this.chipService.getChipAmount();

    return {
      status: true,
      amount,
    };
  }

  @Put('amount')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  public setChipAmount(
    @Body() updateAmountDto: SetChipsAmountDto,
  ): Promise<void> {
    return this.chipService.setChipAmount(updateAmountDto.amount);
  }
}
