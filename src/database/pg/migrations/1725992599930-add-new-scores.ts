import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewScores1725992599930 implements MigrationInterface {
  name = 'AddNewScores1725992599930';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "INSERT INTO globals (label, value) VALUES ('GAME_DURATION', 10)",
    );

    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS public.game_over_individual_logs_id_seq; 
        CREATE TABLE IF NOT EXISTS public.game_over_individual_logs (
            id BIGINT NOT NULL DEFAULT nextval('game_over_individual_logs_id_seq'::regclass),
            game_id varchar(40) NOT NULL,
            reporter_account_id varchar(60) NOT NULL,
            player_account_id varchar(60) NOT NULL,
            kills integer DEFAULT 0,
            deaths integer DEFAULT 0,
            headshots integer DEFAULT 0,
            created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
        );`,
    );

    await queryRunner.query(
      `ALTER TABLE "gamers" ADD COLUMN "kills" integer DEFAULT 0; 
       ALTER TABLE "gamers" ADD COLUMN "deaths" integer DEFAULT 0; 
       ALTER TABLE "gamers" ADD COLUMN "headshots" integer DEFAULT 0;`,
    );

    await queryRunner.query(
      `ALTER TABLE "gamers_logs" ADD COLUMN "kills" integer DEFAULT 0; 
       ALTER TABLE "gamers_logs" ADD COLUMN "deaths" integer DEFAULT 0;
       ALTER TABLE "gamers_logs" ADD COLUMN "headshots" integer DEFAULT 0;`,
    );

    await queryRunner.query(
      `ALTER TABLE "game_over_logs" ADD COLUMN "kills" integer DEFAULT 0; 
       ALTER TABLE "game_over_logs" ADD COLUMN "deaths" integer DEFAULT 0;
       ALTER TABLE "game_over_logs" ADD COLUMN "headshots" integer DEFAULT 0;`,
    );

    await queryRunner.query(
      `ALTER TABLE "game_party" RENAME COLUMN "game_over" TO "results_processed"; 
       ALTER TABLE "game_party" ADD COLUMN "finished_at" timestamp without time zone;
       ALTER TABLE "game_party" ADD CONSTRAINT "unique_game_account" UNIQUE ("hash", "account_id");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DELETE FROM globals WHERE label = 'GAME_DURATION'",
    );

    await queryRunner.query('DROP TABLE public.game_over_individual_logs');

    await queryRunner.query(
      `ALTER TABLE "gamers" DROP COLUMN "kills"; 
       ALTER TABLE "gamers" DROP COLUMN "deaths"; 
       ALTER TABLE "gamers" DROP COLUMN "headshots";`,
    );

    await queryRunner.query(
      `ALTER TABLE "gamers_logs" DROP COLUMN "kills"; 
       ALTER TABLE "gamers_logs" DROP COLUMN "deaths";
       ALTER TABLE "gamers_logs" DROP COLUMN "headshots";`,
    );

    await queryRunner.query(
      `ALTER TABLE "game_over_logs" DROP COLUMN "kills"; 
       ALTER TABLE "game_over_logs" DROP COLUMN "deaths";
       ALTER TABLE "game_over_logs" DROP COLUMN "headshots";`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_party" RENAME COLUMN "results_processed" TO "game_over";
       ALTER TABLE "game_party" DROP COLUMN "finished_at";
       ALTER TABLE "game_party" DROP CONSTRAINT "unique_game_account";`,
    );
  }
}
