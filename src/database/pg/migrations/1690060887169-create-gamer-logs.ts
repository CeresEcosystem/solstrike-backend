import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGamerLogs1690060887169 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS public.gamers_logs (
            id integer NOT NULL,
            season_id BIGINT DEFAULT 0 NOT NULL,
            username character varying(100) DEFAULT NULL::character varying,
            account_id character varying(100) NOT NULL,
            chips numeric DEFAULT 0,
            referral_code character varying(40) DEFAULT NULL::character NOT NULL,
            referral_used boolean DEFAULT false,
            referral_user_id integer DEFAULT 0,
            points numeric DEFAULT 0,
            party integer DEFAULT 0,
            created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
        );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE public.gamers_logs');
  }
}
