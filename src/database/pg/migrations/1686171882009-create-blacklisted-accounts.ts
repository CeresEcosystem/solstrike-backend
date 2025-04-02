import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlacklistedAccounts1686171882009
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS public.blacklisted_accounts_id_seq; \
        CREATE TABLE IF NOT EXISTS public.blacklisted_accounts (
            id BIGINT NOT NULL DEFAULT nextval('blacklisted_accounts_id_seq'::regclass),
            username character varying(100) DEFAULT NULL,
            account_id character varying(100) NOT NULL UNIQUE,
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE public.blacklisted_accounts');
  }
}
