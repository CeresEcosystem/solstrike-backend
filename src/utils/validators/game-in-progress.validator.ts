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
export class GameInProgressValidator implements ValidatorConstraintInterface {
  constructor(private readonly gameService: GameService) {}

  public validate(gameId: string): Promise<boolean> {
    return this.gameService.isGameInProgress(gameId);
  }

  public defaultMessage(): string {
    return 'In progress game not found.';
  }
}

export function IsGameInProgress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: GameInProgressValidator,
    });
  };
}
