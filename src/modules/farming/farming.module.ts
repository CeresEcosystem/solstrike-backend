import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FarmingService } from './farming.service';
import { ConfigModule } from '@nestjs/config';
import { FarmingController } from './farming.controller';
import { BurningModule } from '../burning/burning.module';
import { BlacklistedModule } from '../blacklisted/blacklisted.module';
import { AccountIdValidator } from 'src/utils/validators/account-id.validator';
import { SoraClientModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [
    HttpModule,
    SoraClientModule,
    BlacklistedModule,
    ConfigModule.forRoot(),
    BurningModule,
  ],
  controllers: [FarmingController],
  providers: [FarmingService, AccountIdValidator],
  exports: [FarmingService],
})
export class FarmingModule {}
