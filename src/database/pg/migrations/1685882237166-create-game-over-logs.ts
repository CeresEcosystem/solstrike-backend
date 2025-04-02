import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGameOverLogs1685882237166 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS public.game_over_logs_id_seq; \
        CREATE TABLE IF NOT EXISTS public.game_over_logs (
            id integer NOT NULL DEFAULT nextval('game_over_logs_id_seq'::regclass),
            hash character varying(60) NOT NULL,
            type character varying(30) NOT NULL,
            type_id integer DEFAULT 0,
            user_id integer DEFAULT 0,
            game_chips numeric DEFAULT 0,
            perc numeric DEFAULT 0,
            gamers smallint DEFAULT 2,
            winners smallint DEFAULT 1,
            total_perc numeric DEFAULT 0,
            points numeric DEFAULT 0,
            nft_points_current numeric DEFAULT 0,
            created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
            nft_boost boolean DEFAULT false,
            nft_checked boolean DEFAULT false,
            PRIMARY KEY (id)
        );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE public.game_over_logs');
  }
}
