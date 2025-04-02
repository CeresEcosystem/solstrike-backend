import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('game_over_individual_logs')
@Unique(['gameId', 'reporterAccountId', 'playerAccountId'])
export class GameOverIndividualLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'game_id' })
  gameId: string;

  @Column({ name: 'reporter_account_id' })
  reporterAccountId: string;

  @Column({ name: 'player_account_id' })
  playerAccountId: string;

  @Column('integer', { name: 'kills' })
  kills: number;

  @Column('integer', { name: 'deaths' })
  deaths: number;

  @Column('integer', { name: 'headshots' })
  headshots: number;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
