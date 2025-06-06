import { IsNotEmpty } from 'class-validator';
import { IsAccountIdValid } from 'src/utils/validators/account-id.validator';
// import { IsAccountNotInGame } from 'src/utils/validators/account-not-in-game.validator';

export class StartGameDto {
  @IsNotEmpty()
  @IsAccountIdValid()
  // @IsAccountNotInGame()
  accountId: string;

  @IsNotEmpty()
  gameId: string;

  @IsNotEmpty()
  signature: string;

  @IsNotEmpty()
  signedMessage: string;
}
