import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGames1686599714881 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS public.game_party_id_seq; \
        CREATE TABLE IF NOT EXISTS public.game_party (
            id BIGINT NOT NULL DEFAULT nextval('game_party_id_seq'::regclass),
            hash character varying(40) NOT NULL,
            account_id character varying(60) NOT NULL,
            created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
            game_over boolean DEFAULT false,
            PRIMARY KEY (id)
        );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE public.game_party');
  }
}
