import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGlobals1686395338330 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS public.globals_sequence; \
        CREATE TABLE IF NOT EXISTS public.globals (
            id BIGINT NOT NULL DEFAULT nextval('globals_sequence'::regclass),
            label character varying(50) NOT NULL,
            updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            value numeric,
            PRIMARY KEY (id)
        );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE public.globals');
  }
}
