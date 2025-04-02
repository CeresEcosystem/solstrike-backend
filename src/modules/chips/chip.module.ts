import { Module } from '@nestjs/common';
import { ChipService } from './chip.service';
import { BlacklistedModule } from '../blacklisted/blacklisted.module';
import { ChipController } from './chip.controller';
import { AccountIdValidator } from 'src/utils/validators/account-id.validator';
import { AuthModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { KeyValueDataModule } from '../key-value-data/key-value-data.module';

@Module({
  imports: [AuthModule, BlacklistedModule, KeyValueDataModule],
  controllers: [ChipController],
  providers: [ChipService, AccountIdValidator],
  exports: [ChipService],
})
export class ChipModule {}
