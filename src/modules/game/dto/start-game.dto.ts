import { IsNotEmpty } from 'class-validator';
import { IsAccountIdValid } from 'src/utils/validators/account-id.validator';

export class StartGameDto {
  @IsNotEmpty()
  @IsAccountIdValid()
  accountId: string;

  @IsNotEmpty()
  gameId: string;

  @IsNotEmpty()
  signature: string;

  @IsNotEmpty()
  signedMessage: string;

  @IsNotEmpty()
  network: string;
}
