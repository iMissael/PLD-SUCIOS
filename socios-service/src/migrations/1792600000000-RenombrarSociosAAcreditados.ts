import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenombrarSociosAAcreditados1792600000000
  implements MigrationInterface
{
  name = 'RenombrarSociosAAcreditados1792600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('"socios"') IS NOT NULL
          AND to_regclass('"acreditados"') IS NULL THEN
          ALTER TABLE "socios" RENAME TO "acreditados";
        END IF;

        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'socios_tipo_persona_enum')
          AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'acreditados_tipo_persona_enum') THEN
          ALTER TYPE "socios_tipo_persona_enum" RENAME TO "acreditados_tipo_persona_enum";
        END IF;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'socios_estatus_enum')
          AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'acreditados_estatus_enum') THEN
          ALTER TYPE "socios_estatus_enum" RENAME TO "acreditados_estatus_enum";
        END IF;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'socios_nivel_riesgo_enum')
          AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'acreditados_nivel_riesgo_enum') THEN
          ALTER TYPE "socios_nivel_riesgo_enum" RENAME TO "acreditados_nivel_riesgo_enum";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'personas_relacionadas' AND column_name = 'socio_id'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'personas_relacionadas' AND column_name = 'acreditado_id'
        ) THEN
          ALTER TABLE "personas_relacionadas"
            RENAME COLUMN "socio_id" TO "acreditado_id";
        END IF;

        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_personas_relacionadas_socio'
            AND conrelid = '"personas_relacionadas"'::regclass
        ) AND NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_personas_relacionadas_acreditado'
            AND conrelid = '"personas_relacionadas"'::regclass
        ) THEN
          ALTER TABLE "personas_relacionadas"
            RENAME CONSTRAINT "FK_personas_relacionadas_socio"
            TO "FK_personas_relacionadas_acreditado";
        END IF;

        IF to_regclass('"IDX_personas_relacionadas_socio_id"') IS NOT NULL
          AND to_regclass('"IDX_personas_relacionadas_acreditado_id"') IS NULL THEN
          ALTER INDEX "IDX_personas_relacionadas_socio_id"
            RENAME TO "IDX_personas_relacionadas_acreditado_id";
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "acreditados"
        ADD COLUMN IF NOT EXISTS "codigo" varchar;
      UPDATE "acreditados"
         SET "codigo" = 'ACR-' || REPLACE("id"::text, '-', '')
       WHERE "codigo" IS NULL;
      ALTER TABLE "acreditados" ALTER COLUMN "codigo" SET NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_acreditados_codigo"
        ON "acreditados" ("codigo");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_acreditados_codigo";
      ALTER TABLE "acreditados" DROP COLUMN IF EXISTS "codigo";

      DO $$
      BEGIN
        IF to_regclass('"IDX_personas_relacionadas_acreditado_id"') IS NOT NULL
          AND to_regclass('"IDX_personas_relacionadas_socio_id"') IS NULL THEN
          ALTER INDEX "IDX_personas_relacionadas_acreditado_id"
            RENAME TO "IDX_personas_relacionadas_socio_id";
        END IF;

        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_personas_relacionadas_acreditado'
            AND conrelid = '"personas_relacionadas"'::regclass
        ) AND NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_personas_relacionadas_socio'
            AND conrelid = '"personas_relacionadas"'::regclass
        ) THEN
          ALTER TABLE "personas_relacionadas"
            RENAME CONSTRAINT "FK_personas_relacionadas_acreditado"
            TO "FK_personas_relacionadas_socio";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'personas_relacionadas' AND column_name = 'acreditado_id'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'personas_relacionadas' AND column_name = 'socio_id'
        ) THEN
          ALTER TABLE "personas_relacionadas"
            RENAME COLUMN "acreditado_id" TO "socio_id";
        END IF;

        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'acreditados_tipo_persona_enum')
          AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'socios_tipo_persona_enum') THEN
          ALTER TYPE "acreditados_tipo_persona_enum" RENAME TO "socios_tipo_persona_enum";
        END IF;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'acreditados_estatus_enum')
          AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'socios_estatus_enum') THEN
          ALTER TYPE "acreditados_estatus_enum" RENAME TO "socios_estatus_enum";
        END IF;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'acreditados_nivel_riesgo_enum')
          AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'socios_nivel_riesgo_enum') THEN
          ALTER TYPE "acreditados_nivel_riesgo_enum" RENAME TO "socios_nivel_riesgo_enum";
        END IF;

        IF to_regclass('"acreditados"') IS NOT NULL
          AND to_regclass('"socios"') IS NULL THEN
          ALTER TABLE "acreditados" RENAME TO "socios";
        END IF;
      END $$;
    `);
  }
}
