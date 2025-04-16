import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUpdateGamerOnGameOverLogFunction1726691330242
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION public.after_insert_game_over_logs_update_gamer_chips()
          RETURNS trigger
          LANGUAGE plpgsql
        AS $function$
        BEGIN
          update gamers 
          set points = points + new.points, 
              kills = kills + new.kills,
              deaths = deaths + new.deaths,
              headshots = headshots + new.headshots
          where id = new.user_id;
        RETURN NEW;
        END;
        $function$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP FUNCTION public.after_insert_game_over_logs_update_gamer_chips',
    );
  }
}
