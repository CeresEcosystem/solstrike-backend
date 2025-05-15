import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { GameService } from 'src/modules/game/game.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class AccountNotInGameValidator implements ValidatorConstraintInterface {
  constructor(private readonly gameService: GameService) {}

  public async validate(accountId: string): Promise<boolean> {
    if (await this.gameService.isPlayerInActiveGame(accountId)) {
      return false;
    }

    return true;
  }

  public defaultMessage(): string {
    return 'Account is already in a game.';
  }
}

export function IsAccountNotInGame(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: AccountNotInGameValidator,
    });
  };
}
