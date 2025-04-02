import { FEE_TYPES } from '../fees-fee-types.enum';

export interface FeeBcDto {
  type: FEE_TYPES;
  fee: number;
}
