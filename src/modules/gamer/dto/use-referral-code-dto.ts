import { IsNotEmpty } from 'class-validator';

export class UseReferralCodeDto {
  @IsNotEmpty()
  referralCode: string;

  @IsNotEmpty()
  signature: string;
}
