import { Column, Entity, PrimaryColumn } from 'typeorm';

export type GameOverLogType = 'winner' | 'referral' | 'loser' | 'burn';

@Entity('game_over_logs')
export class GameOverLog {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'hash' })
  gameId: string;

  @Column()
  type: GameOverLogType;

  @Column({ name: 'type_id' })
  typeId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'decimal', name: 'game_chips' })
  gameChips: number;

  @Column({ type: 'decimal' })
  perc: number;

  @Column({ name: 'total_perc' })
  totalPerc: number;

  @Column({ name: 'gamers' })
  gamersCount: number;

  @Column({ name: 'winners' })
  winnersCount: number;

  @Column({ type: 'decimal' })
  points: number;

  @Column('integer', { name: 'kills' })
  kills: number;

  @Column('integer', { name: 'deaths' })
  deaths: number;

  @Column('integer', { name: 'headshots' })
  headshots: number;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
