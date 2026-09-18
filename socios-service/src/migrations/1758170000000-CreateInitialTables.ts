import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración manual (no auto-generada) para las tablas iniciales:
 * usuarios, socios, personas_relacionadas.
 *
 * Usa guardas IF NOT EXISTS / DO $$ ... EXCEPTION para poder re-ejecutarse
 * sin romper si algo ya existe, siguiendo la misma convención que en
 * denuncias-app (migraciones manuales en vez de auto-generadas).
 */
export class CreateInitialTables1758170000000 implements MigrationInterface {
  name = 'CreateInitialTables1758170000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Necesario para gen_random_uuid()
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'usuarios_rol_enum') THEN
          CREATE TYPE "usuarios_rol_enum" AS ENUM ('ADMIN', 'ANALISTA', 'CONSULTA');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'socios_tipo_persona_enum') THEN
          CREATE TYPE "socios_tipo_persona_enum" AS ENUM ('FISICA', 'MORAL');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'socios_estatus_enum') THEN
          CREATE TYPE "socios_estatus_enum" AS ENUM ('ACTIVO', 'INACTIVO');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'socios_nivel_riesgo_enum') THEN
          CREATE TYPE "socios_nivel_riesgo_enum" AS ENUM ('BAJO', 'MEDIO', 'ALTO');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'personas_relacionadas_tipo_relacion_enum') THEN
          CREATE TYPE "personas_relacionadas_tipo_relacion_enum" AS ENUM (
            'AVAL', 'CONYUGE', 'REPRESENTANTE_LEGAL', 'BENEFICIARIO_CONTROLADOR', 'REFERENCIA'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "usuarios" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "nombre" varchar NOT NULL,
        "email" varchar NOT NULL,
        "password_hash" varchar NOT NULL,
        "rol" "usuarios_rol_enum" NOT NULL DEFAULT 'CONSULTA',
        "activo" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_usuarios_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_usuarios_email" UNIQUE ("email")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "socios" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tipo_persona" "socios_tipo_persona_enum" NOT NULL DEFAULT 'FISICA',
        "nombre" varchar NOT NULL,
        "apellido_paterno" varchar,
        "apellido_materno" varchar,
        "rfc" varchar,
        "curp" varchar,
        "fecha_nacimiento" date,
        "nacionalidad" varchar,
        "zona_geografica" varchar,
        "pais" varchar,
        "localidad" varchar,
        "entidad" varchar,
        "tiempo_constitucion" int,
        "experiencia_actividad" int,
        "actividad_economica" varchar,
        "tiene_historial" boolean NOT NULL DEFAULT false,
        "origen_recursos" text,
        "destino_recursos" text,
        "domicilio" varchar,
        "telefono" varchar,
        "email" varchar,
        "fecha_alta" date NOT NULL DEFAULT CURRENT_DATE,
        "estatus" "socios_estatus_enum" NOT NULL DEFAULT 'ACTIVO',
        "nivel_riesgo" "socios_nivel_riesgo_enum",
        "es_pep" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_socios_id" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "personas_relacionadas" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "socio_id" uuid NOT NULL,
        "tipo_relacion" "personas_relacionadas_tipo_relacion_enum" NOT NULL,
        "nombre" varchar NOT NULL,
        "apellido_paterno" varchar,
        "apellido_materno" varchar,
        "rfc" varchar,
        "curp" varchar,
        "parentesco" varchar,
        "telefono" varchar,
        "email" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_personas_relacionadas_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_personas_relacionadas_socio" FOREIGN KEY ("socio_id")
          REFERENCES "socios" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_personas_relacionadas_socio_id"
        ON "personas_relacionadas" ("socio_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "personas_relacionadas";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "socios";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "usuarios";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "personas_relacionadas_tipo_relacion_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "socios_nivel_riesgo_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "socios_estatus_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "socios_tipo_persona_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "usuarios_rol_enum";`);
  }
}
