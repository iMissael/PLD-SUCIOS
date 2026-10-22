import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompletarPaisYFechaInicioActividad1792600002000
  implements MigrationInterface
{
  name = 'CompletarPaisYFechaInicioActividad1792600002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "acreditados"
         SET "pais_nacimiento" = 'MEXICO'
       WHERE "pais_nacimiento" IS NULL OR BTRIM("pais_nacimiento") = '';

      UPDATE "acreditados"
         SET "fecha_inicio_actividad" =
           "fecha_alta" - MAKE_INTERVAL(
             years => GREATEST(
               COALESCE("experiencia_actividad", "tiempo_constitucion", 1),
               1
             )
           )
       WHERE "fecha_inicio_actividad" IS NULL;
    `);
  }

  public async down(): Promise<void> {
    // Backfilled values cannot be distinguished from values provided by clients.
  }
}
