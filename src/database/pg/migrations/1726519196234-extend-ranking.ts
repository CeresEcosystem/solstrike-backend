import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendRankings1726519196234 implements MigrationInterface {
  name = 'ExtendRankings1726519196234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rankings" ADD COLUMN "kills" integer DEFAULT 0; 
       ALTER TABLE "rankings" ADD COLUMN "deaths" integer DEFAULT 0; 
       ALTER TABLE "rankings" ADD COLUMN "headshots" integer DEFAULT 0;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rankings" DROP COLUMN "kills"; 
       ALTER TABLE "rankings" DROP COLUMN "deaths"; 
       ALTER TABLE "rankings" DROP COLUMN "headshots";`,
    );
  }
}
