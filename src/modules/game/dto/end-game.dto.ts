import { IsNotEmpty, ValidateNested } from 'class-validator';
import { IsAccountIdValid } from 'src/utils/validators/account-id.validator';
import { IsGameInProgress } from 'src/utils/validators/game-in-progress.validator';
import { EndGameResultDto } from './end-game-player-result.dto';
import { Type } from 'class-transformer';
import { IsPlayerGameInProgress } from 'src/utils/validators/player-game-in-progress.validator';

export class EndGameDto {
  @IsNotEmpty()
  @IsAccountIdValid()
  @IsPlayerGameInProgress()
  accountId: string;

  @IsNotEmpty()
  @IsGameInProgress()
  gameId: string;

  @ValidateNested({ each: true })
  @Type(() => EndGameResultDto)
  playerResults: EndGameResultDto[];

  @IsNotEmpty()
  signature: string;

  @IsNotEmpty()
  signedMessage: string;

  @IsNotEmpty()
  network: string;
}
