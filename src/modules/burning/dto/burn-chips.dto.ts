import { IsPositive } from 'class-validator';

export class BurnChipsDto {
  @IsPositive()
  amount: number;
}
