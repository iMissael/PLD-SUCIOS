import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaisNacimientoYFechaInicioActividad1792600001000
  implements MigrationInterface
{
  name = 'PaisNacimientoYFechaInicioActividad1792600001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "acreditados"
        ADD COLUMN IF NOT EXISTS "pais_nacimiento" varchar,
        ADD COLUMN IF NOT EXISTS "fecha_inicio_actividad" date;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "acreditados"
        DROP COLUMN IF EXISTS "fecha_inicio_actividad",
        DROP COLUMN IF EXISTS "pais_nacimiento";
    `);
  }
}
