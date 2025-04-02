import { IsNotEmpty } from 'class-validator';

export class SetGameDurationDto {
  @IsNotEmpty()
  durationInMinutes: number;
}
