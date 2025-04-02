import { Module } from '@nestjs/common';
import { SoraClientModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { FeesController } from './fees.controller';
import { FeesService } from './fees.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fee } from './entity/fee.entity';
import { FeeToEntityMapper } from './mapper/fee-to-entity.mapper';
import { FeesRepository } from './fees.repository';
import { FeeToDtoMapper } from './mapper/fee-to-dto.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Fee]), SoraClientModule],
  controllers: [FeesController],
  providers: [FeesService, FeesRepository, FeeToEntityMapper, FeeToDtoMapper],
  exports: [],
})
export class FeesModule {}
