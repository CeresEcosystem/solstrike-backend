import { IsString } from 'class-validator';

export class UpsertBlacklistedAccountDto {
  @IsString()
  username: string;

  @IsString()
  accountId: string;
}
