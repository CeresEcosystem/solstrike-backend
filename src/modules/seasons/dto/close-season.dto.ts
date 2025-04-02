import { IsDateString, IsString } from 'class-validator';

export class CloseSeasonDto {
  @IsString()
  name: string;

  @IsDateString()
  dateFrom: Date;

  @IsDateString()
  dateTo: Date;
}
