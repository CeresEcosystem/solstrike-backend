import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFee1721898766384 implements MigrationInterface {
  name = 'CreateFee1721898766384';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`farming_fee\` 
              (id int NOT NULL AUTO_INCREMENT, 
              type enum ('Deposit', 'Rewards', 'Withdraw') NOT NULL, 
              fee float NOT NULL, 
              updated_at timestamp NOT NULL, 
              PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `farming_fee`');
  }
}
