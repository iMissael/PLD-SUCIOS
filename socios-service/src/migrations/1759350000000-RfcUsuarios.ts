import { MigrationInterface, QueryRunner } from 'typeorm';

export class RfcUsuarios1759350000000 implements MigrationInterface {
  name = 'RfcUsuarios1759350000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "rfc" varchar;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "rfc";`);
  }
}
