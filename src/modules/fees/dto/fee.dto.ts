import { FEE_TYPES } from '../fees-fee-types.enum';

export interface FeeDto {
  type: FEE_TYPES;
  fee: number;
  updatedAt: Date;
}
