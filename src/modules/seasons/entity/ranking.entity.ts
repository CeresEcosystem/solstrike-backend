import { Gamer } from 'src/modules/gamer/entity/gamer.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('rankings')
export class Ranking {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'season_id' })
  seasonId: string;

  @ManyToOne(() => Gamer)
  @JoinColumn({ name: 'user_id' })
  gamer: Gamer;

  @Column()
  points: number;

  @Column({ name: 'party_count' })
  partyCount: number;

  @Column()
  place: number;

  @Column('integer', { name: 'kills' })
  kills: number;

  @Column('integer', { name: 'deaths' })
  deaths: number;

  @Column('integer', { name: 'headshots' })
  headshots: number;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
