import { IsNotEmpty } from 'class-validator';

export class ClaimBackDeoDto {
  @IsNotEmpty()
  deo: string;

  @IsNotEmpty()
  signature: string;

  @IsNotEmpty()
  network: string;
}
