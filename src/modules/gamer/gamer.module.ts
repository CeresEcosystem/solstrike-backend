import { Module } from '@nestjs/common';
import { GamerService } from './gamer.service';
import { GamerController } from './gamer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gamer } from './entity/gamer.entity';
import { GamerToDtoMapper } from './mapper/gamer-to-dto.mapper';
import { BlacklistedModule } from '../blacklisted/blacklisted.module';
import { AccountIdValidator } from 'src/utils/validators/account-id.validator';
import { GamerLog } from './entity/gamer-log.entity';
import { AuthModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [
    AuthModule,
    BlacklistedModule,
    TypeOrmModule.forFeature([Gamer, GamerLog], 'pg'),
  ],
  controllers: [GamerController],
  providers: [GamerService, GamerToDtoMapper, AccountIdValidator],
  exports: [GamerService],
})
export class GamerModule {}
