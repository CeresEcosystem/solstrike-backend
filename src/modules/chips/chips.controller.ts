/*

    THIS CONTROLLER IS FOR TESTING PURPOSES ONLY!

*/

import { Controller, Post, Body } from '@nestjs/common';
import { ReserveChipService } from './reserve-chips.service';
import { ReserveChipDto } from './dto/reserve-chips.dto';

@Controller('chips')
export class ChipsController {
  constructor(private readonly reserveChipService: ReserveChipService) {}

  @Post('reserve')
  async reserve(@Body() reserveChipDto: ReserveChipDto): Promise<string> {
    const tx = await this.reserveChipService.reserveChips(reserveChipDto);
    return tx;
  }
}
