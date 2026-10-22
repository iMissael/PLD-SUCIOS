import { MigrationInterface, QueryRunner } from 'typeorm';

export class DomicilioCreditoHistorialAcreditados1792600003000
  implements MigrationInterface
{
  name = 'DomicilioCreditoHistorialAcreditados1792600003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "acreditados"
        ADD COLUMN IF NOT EXISTS "domicilio_localidad_id" integer,
        ADD COLUMN IF NOT EXISTS "credito_solicitado" jsonb,
        ADD COLUMN IF NOT EXISTS "historial_crediticio" jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "acreditados"
        DROP COLUMN IF EXISTS "historial_crediticio",
        DROP COLUMN IF EXISTS "credito_solicitado",
        DROP COLUMN IF EXISTS "domicilio_localidad_id";
    `);
  }
}
