import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('blacklisted_accounts')
export class BlacklistedAccount {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  username: string;

  @Column({ name: 'account_id', unique: true })
  accountId: string;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
