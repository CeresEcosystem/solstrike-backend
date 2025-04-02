import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertDeoBurnedValue1687456878158 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "INSERT INTO key_value_data VALUES ('deo-burned', '746837.61', now());",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DELETE FROM key_value_data WHERE id = 'deo-burned'",
    );
  }
}
