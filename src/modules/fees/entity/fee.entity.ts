import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { FEE_TYPES } from '../fees-fee-types.enum';

@Entity('farming_fee')
export class Fee {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('enum', { enum: FEE_TYPES })
  type: FEE_TYPES;

  @Column('float', { name: 'fee' })
  fee: number;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
