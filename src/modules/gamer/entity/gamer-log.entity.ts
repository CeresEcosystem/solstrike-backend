import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('gamers_logs')
export class GamerLog {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'season_id' })
  seasonId: string;

  @Column()
  username: string;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ name: 'referral_code' })
  referralCode: string;

  @Column({ name: 'referral_used' })
  referralUsed: boolean;

  @Column({ name: 'referral_user_id' })
  referralUserId: number;

  @Column({ name: 'reserved_chips', type: 'decimal' })
  reservedChips: number;

  @Column({ type: 'decimal' })
  points: number;

  @Column({ name: 'party' })
  partyCount: number;

  @Column('integer', { name: 'kills' })
  kills: number;

  @Column('integer', { name: 'deaths' })
  deaths: number;

  @Column('integer', { name: 'headshots' })
  headshots: number;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
