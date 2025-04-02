export interface FarmDto {
  poolAsset: string;
  rewardAsset: string;
  baseAssetId: string;
  baseAsset: string;
  multiplier: number;
  isCore: boolean;
  multiplierPercent: number;
  isRemoved: boolean;
  depositFee: number;
  tvlPercent: number;
  pooledTokens: number;
  rewards: number;
}
