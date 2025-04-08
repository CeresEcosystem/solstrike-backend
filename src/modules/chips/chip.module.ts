import { Module } from '@nestjs/common';
import { ChipsService } from './chip.service';
import { GamerModule } from '../gamer/gamer.module';

@Module({
  imports: [GamerModule],
  controllers: [],
  providers: [ChipsService],
  exports: [ChipsService],
})
export class ChipsModule {}
