import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistedAccount } from './entity/blacklisted.entity';
import { BlacklistedService } from './blacklisted.service';
import { BlacklistedController } from './blacklisted.controller';
import { BlacklistedToDtoMapper } from './mapper/entity-to-dto.mapper';
import { AuthModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([BlacklistedAccount], 'pg')],
  controllers: [BlacklistedController],
  providers: [BlacklistedService, BlacklistedToDtoMapper],
  exports: [BlacklistedService],
})
export class BlacklistedModule {}
