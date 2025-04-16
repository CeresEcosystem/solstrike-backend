import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGamers1685977050546 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS public.gamers_id_seq; \
        CREATE TABLE IF NOT EXISTS public.gamers (
            id integer NOT NULL DEFAULT nextval('gamers_id_seq'::regclass),
            username character varying(100) DEFAULT NULL::character varying,
            account_id character varying(100) NOT NULL,
            reserved_chips numeric DEFAULT 0,
            referral_code character varying(40) DEFAULT public.random_string(24) NOT NULL,
            referral_used boolean DEFAULT false,
            referral_user_id integer DEFAULT 0,
            points numeric DEFAULT 0,
            party integer DEFAULT 0,
            created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE public.gamers');
  }
}
