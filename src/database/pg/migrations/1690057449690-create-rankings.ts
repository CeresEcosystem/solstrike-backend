import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRankings1690057449690 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS public.rankings_id_seq; \
        CREATE TABLE IF NOT EXISTS public.rankings (
            id BIGINT NOT NULL DEFAULT nextval('rankings_id_seq'::regclass),
            season_id BIGINT NOT NULL,
            user_id BIGINT NOT NULL,
            username character varying(60),
            points numeric DEFAULT 0,
            place integer DEFAULT 0,
            created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id)
        );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE public.rankings');
  }
}
