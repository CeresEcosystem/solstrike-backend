import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGamers1744369824924 implements MigrationInterface {
  name = 'CreateGamers1744369824924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "gamers" (
            "id" SERIAL NOT NULL, 
            "username" character varying, 
            "account_id" character varying NOT NULL, 
            "referral_code" character varying, 
            "referral_used" boolean NOT NULL DEFAULT false, 
            "referral_user_id" integer, 
            "reserved_chips" numeric NOT NULL DEFAULT '0', 
            "points" numeric NOT NULL DEFAULT '0', 
            "party" integer NOT NULL DEFAULT '0', 
            "kills" integer NOT NULL DEFAULT '0', 
            "deaths" integer NOT NULL DEFAULT '0', 
            "headshots" integer NOT NULL DEFAULT '0', 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_b67b222395b6c2e3dd4a56b5c26" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "gamers"`);
  }
}
