import { IsNotEmpty, IsNumber } from 'class-validator';

export class SetDeoBurnedDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
