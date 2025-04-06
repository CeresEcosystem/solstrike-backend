import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGamerLogs1743897591067 implements MigrationInterface {
  name = 'CreateGamerLogs1743897591067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "gamers_logs" (
            "id" integer NOT NULL, 
            "season_id" character varying NOT NULL, 
            "username" character varying NOT NULL, 
            "account_id" character varying NOT NULL, 
            "referral_code" character varying NOT NULL, 
            "referral_used" boolean NOT NULL, 
            "referral_user_id" integer NOT NULL, 
            "reserved_chips" numeric NOT NULL, 
            "points" numeric NOT NULL, 
            "party" integer NOT NULL, 
            "kills" integer NOT NULL, 
            "deaths" integer NOT NULL, 
            "headshots" integer NOT NULL, 
            "created_at" TIMESTAMP NOT NULL, 
            CONSTRAINT "PK_446f6df10cfb1131997adc3b8a8" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "gamers_logs"`);
  }
}
