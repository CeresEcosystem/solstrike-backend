import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('seasons')
export class Season {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column('date', { name: 'date_from' })
  dateFrom: Date;

  @Column('date', { name: 'date_to' })
  dateTo: Date;

  @Column()
  status: boolean;
}
