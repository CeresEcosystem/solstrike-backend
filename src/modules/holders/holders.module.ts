import { Module } from '@nestjs/common';
import { HoldersService } from './holders.service';
import { HoldersController } from './holders.controller';
import { SoraClientModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [SoraClientModule],
  controllers: [HoldersController],
  providers: [HoldersService],
})
export class HoldersModule {}
