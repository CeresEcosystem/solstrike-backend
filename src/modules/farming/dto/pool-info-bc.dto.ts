export interface PoolInfoBcDto {
  baseAsset: { code: string };
  depositFee: string;
  isCore: boolean;
  isFarm: boolean;
  isRemoved: boolean;
  multiplier: string;
  rewards: string;
  rewardsToBeDistributed: string;
  totalTokensInPool: string;
}
