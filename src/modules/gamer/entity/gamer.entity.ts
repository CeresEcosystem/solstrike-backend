import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('gamers')
export class Gamer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  username: string;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ name: 'referral_code', nullable: true })
  referralCode: string;

  @Column({ name: 'referral_used', default: false })
  referralUsed: boolean;

  @Column({ name: 'referral_user_id', nullable: true })
  referralUserId: number;

  @Column({ name: 'reserved_chips', type: 'decimal', default: 0 })
  reservedChips: number;

  @Column({ type: 'decimal', default: 0 })
  points: number;

  @Column({ name: 'party', default: 0 })
  partyCount: number;

  @Column('integer', { name: 'kills', default: 0 })
  kills: number;

  @Column('integer', { name: 'deaths', default: 0 })
  deaths: number;

  @Column('integer', { name: 'headshots', default: 0 })
  headshots: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
