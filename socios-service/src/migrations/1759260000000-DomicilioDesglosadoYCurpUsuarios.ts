import { MigrationInterface, QueryRunner } from 'typeorm';

const COLUMNAS_DOMICILIO = `
  ADD COLUMN IF NOT EXISTS "domicilio_calle" varchar,
  ADD COLUMN IF NOT EXISTS "domicilio_numero_exterior" varchar,
  ADD COLUMN IF NOT EXISTS "domicilio_numero_interior" varchar,
  ADD COLUMN IF NOT EXISTS "domicilio_colonia" varchar,
  ADD COLUMN IF NOT EXISTS "domicilio_codigo_postal" varchar(5),
  ADD COLUMN IF NOT EXISTS "domicilio_municipio" varchar,
  ADD COLUMN IF NOT EXISTS "domicilio_entidad" varchar,
  ADD COLUMN IF NOT EXISTS "domicilio_pais" varchar
`;

const DROP_COLUMNAS_DOMICILIO = `
  DROP COLUMN IF EXISTS "domicilio_calle",
  DROP COLUMN IF EXISTS "domicilio_numero_exterior",
  DROP COLUMN IF EXISTS "domicilio_numero_interior",
  DROP COLUMN IF EXISTS "domicilio_colonia",
  DROP COLUMN IF EXISTS "domicilio_codigo_postal",
  DROP COLUMN IF EXISTS "domicilio_municipio",
  DROP COLUMN IF EXISTS "domicilio_entidad",
  DROP COLUMN IF EXISTS "domicilio_pais"
`;

/**
 * - socios: el domicilio de texto libre pasa a columnas desglosadas
 *   (domicilio_calle, domicilio_numero_exterior, ...). El texto anterior se
 *   conserva en domicilio_calle para no perder información.
 * - usuarios (empleados): se agregan curp y el mismo domicilio desglosado.
 */
export class DomicilioDesglosadoYCurpUsuarios1759260000000 implements MigrationInterface {
  name = 'DomicilioDesglosadoYCurpUsuarios1759260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "socios" ${COLUMNAS_DOMICILIO};`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'socios' AND column_name = 'domicilio'
        ) THEN
          UPDATE "socios"
             SET "domicilio_calle" = "domicilio",
                 "domicilio_entidad" = COALESCE("domicilio_entidad", "entidad"),
                 "domicilio_pais" = COALESCE("domicilio_pais", "pais")
           WHERE "domicilio" IS NOT NULL AND "domicilio_calle" IS NULL;
          ALTER TABLE "socios" DROP COLUMN "domicilio";
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "usuarios"
        ADD COLUMN IF NOT EXISTS "curp" varchar,
        ${COLUMNAS_DOMICILIO};
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "curp", ${DROP_COLUMNAS_DOMICILIO};`);

    await queryRunner.query(`ALTER TABLE "socios" ADD COLUMN IF NOT EXISTS "domicilio" varchar;`);
    await queryRunner.query(`
      UPDATE "socios"
         SET "domicilio" = NULLIF(CONCAT_WS(', ',
               NULLIF(CONCAT_WS(' ', "domicilio_calle", "domicilio_numero_exterior", "domicilio_numero_interior"), ''),
               "domicilio_colonia",
               "domicilio_codigo_postal",
               "domicilio_municipio"
             ), '');
    `);
    await queryRunner.query(`ALTER TABLE "socios" ${DROP_COLUMNAS_DOMICILIO};`);
  }
}
