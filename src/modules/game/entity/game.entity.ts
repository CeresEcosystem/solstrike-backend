import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('game_party')
@Unique(['gameId', 'accountId'])
export class Game {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'hash' })
  gameId: string;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ name: 'results_processed' })
  resultsProcessed: boolean;

  @Column('timestamp', { name: 'finished_at' })
  finishedAt: Date;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
