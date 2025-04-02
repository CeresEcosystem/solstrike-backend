export interface UserInfoBcDto {
  baseAsset: { code: string };
  isFarm: boolean;
  poolAsset: { code: string };
  pooledTokens: string;
  rewardAsset: { code: string };
  rewards: string;
}
