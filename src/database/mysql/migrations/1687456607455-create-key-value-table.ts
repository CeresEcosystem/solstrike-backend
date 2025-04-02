import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateKeyValueTable1687456607455 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS key_value_data ( 
            id VARCHAR(100) NOT NULL PRIMARY KEY, 
            value VARCHAR(100), 
            updated_at DATETIME NOT NULL 
        );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE key_value_data');
  }
}
