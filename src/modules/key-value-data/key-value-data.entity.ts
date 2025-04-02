import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('globals')
export class Globals {
  @PrimaryColumn()
  id: string;

  @Column()
  label: string;

  @Column({ type: 'decimal' })
  value: number;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
