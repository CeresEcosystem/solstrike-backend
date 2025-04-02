import { IsNotEmpty, Min } from 'class-validator';
import { IsPlayerInGame } from 'src/utils/validators/player-game.validator';
import { IsAccountIdValid } from 'src/utils/validators/account-id.validator';

export class EndGameResultDto {
  @IsNotEmpty()
  @IsAccountIdValid()
  @IsPlayerInGame()
  accountId: string;

  @IsNotEmpty()
  @Min(0)
  kills: number;

  @IsNotEmpty()
  @Min(0)
  deaths: number;

  @IsNotEmpty()
  @Min(0)
  headshots: number;
}
