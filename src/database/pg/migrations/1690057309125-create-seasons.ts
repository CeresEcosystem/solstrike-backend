import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeasons1690057309125 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS public.seasons_id_seq; \
        CREATE TABLE IF NOT EXISTS public.seasons (
            id BIGINT NOT NULL DEFAULT nextval('seasons_id_seq'::regclass),
            name character varying(100) NOT NULL,
            date_from date,
            date_to date,
            status boolean DEFAULT false,
            PRIMARY KEY (id)
        );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE public.seasons');
  }
}
