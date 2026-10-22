import { MigrationInterface, QueryRunner } from 'typeorm';

export class LocalidadIdDomicilioUsuario1792600004000
  implements MigrationInterface
{
  name = 'LocalidadIdDomicilioUsuario1792600004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "usuarios"
        ADD COLUMN IF NOT EXISTS "domicilio_localidad_id" integer;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "usuarios"
        DROP COLUMN IF EXISTS "domicilio_localidad_id";
    `);
  }
}
