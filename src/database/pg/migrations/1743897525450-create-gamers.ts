import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGamers1743897525450 implements MigrationInterface {
  name = 'CreateGamers1743897525450';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "gamers" (
            "id" SERIAL NOT NULL, 
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
            "updated_at" TIMESTAMP NOT NULL, 
            CONSTRAINT "PK_b67b222395b6c2e3dd4a56b5c26" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "gamers"`);
  }
}
