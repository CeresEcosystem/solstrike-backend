export interface StakeDto {
  poolAsset: string;
  rewardAsset: string;
  multiplier: number;
  isCore: boolean;
  multiplierPercent: number;
  isRemoved: boolean;
  depositFee: number;
  totalStaked: number;
  pooledTokens: number;
  rewards: number;
}
