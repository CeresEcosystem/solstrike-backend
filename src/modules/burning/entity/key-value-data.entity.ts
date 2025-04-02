import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('key_value_data')
export class KeyValueData {
  @PrimaryColumn()
  id: string;

  @Column()
  value: string;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
