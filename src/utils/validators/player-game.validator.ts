import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { EndGameDto } from 'src/modules/game/dto/end-game.dto';
import { GameService } from 'src/modules/game/game.service';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ async: true })
export class PlayerGameValidator implements ValidatorConstraintInterface {
  constructor(private readonly gameService: GameService) {}

  public validate(
    accountId: string,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const endGameDto = validationArguments.object as EndGameDto;

    return this.gameService.isPlayerInGame(endGameDto.gameId, accountId);
  }

  public defaultMessage(): string {
    return 'Account game is not in progress.';
  }
}

export function IsPlayerInGame(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: PlayerGameValidator,
    });
  };
}
