import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Globals } from './key-value-data.entity';
import { KeyValueDataService } from './key-value-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([Globals], 'pg')],
  controllers: [],
  providers: [KeyValueDataService],
  exports: [KeyValueDataService],
})
export class KeyValueDataModule {}
