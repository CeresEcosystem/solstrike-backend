import { Module } from '@nestjs/common';
import { ChipListenerService } from './chip-listener.service';
import { ReserveChipService } from './reserve-chips.service';
import { GamerModule } from '../gamer/gamer.module';
import { ChipsController } from './chips.controller';

@Module({
  imports: [GamerModule],
  controllers: [ChipsController],
  providers: [ChipListenerService, ReserveChipService],
  exports: [ChipListenerService],
})
export class ChipsModule {}
