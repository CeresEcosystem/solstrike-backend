export interface FarmDataDto {
  id: number;
  underlyingAssetName: string;
  tvl: number;
  apr: number;
  depositFeeInPercent: number;
  rewardToken: string;
  rewardTokenPerDay: string;
  rewardTokenPrice: number;
}
