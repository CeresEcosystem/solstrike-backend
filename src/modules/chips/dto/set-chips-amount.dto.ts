import { IsNumber } from 'class-validator';

export class SetChipsAmountDto {
  @IsNumber()
  amount: number;
}
