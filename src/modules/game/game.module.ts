import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entity/game.entity';
import { BlacklistedModule } from '../blacklisted/blacklisted.module';
import { GameController } from './game.controller';
import { GamerModule } from '../gamer/gamer.module';
import { AccountIdValidator } from 'src/utils/validators/account-id.validator';
import { ChipModule } from '../chips/chip.module';
import { GameOverLogModule } from '../game-over-log/game-over-log.module';
import { AuthModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { KeyValueDataModule } from '../key-value-data/key-value-data.module';
import { GameInProgressValidator } from 'src/utils/validators/game-in-progress.validator';
import { PlayerGameValidator } from 'src/utils/validators/player-game.validator';
import { PlayerGameInProgressValidator } from 'src/utils/validators/player-game-in-progress.validator';
import { EndGameProcessorService } from './end-game-processor.service';

@Module({
  imports: [
    AuthModule,
    BlacklistedModule,
    GamerModule,
    ChipModule,
    GameOverLogModule,
    KeyValueDataModule,
    TypeOrmModule.forFeature([Game], 'pg'),
  ],
  controllers: [GameController],
  providers: [
    GameService,
    AccountIdValidator,
    GameInProgressValidator,
    PlayerGameValidator,
    PlayerGameInProgressValidator,
    EndGameProcessorService,
  ],
})
export class GameModule {}
