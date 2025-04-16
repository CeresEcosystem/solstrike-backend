import { Module } from '@nestjs/common';
import { ChipListenerService } from './chip-listener.service';
import { GamerModule } from '../gamer/gamer.module';

@Module({
  imports: [GamerModule],
  controllers: [],
  providers: [ChipListenerService],
  exports: [ChipListenerService],
})
export class ChipsModule {}
