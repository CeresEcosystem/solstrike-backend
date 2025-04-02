import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateGamerDto {
  @IsNotEmpty()
  @IsString()
  username: string;
}
