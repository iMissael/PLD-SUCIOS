import { MigrationInterface, QueryRunner } from 'typeorm';

export class TipoPersonaActividadEmpresarial1759440000000 implements MigrationInterface {
  name = 'TipoPersonaActividadEmpresarial1759440000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "socios_tipo_persona_enum" ADD VALUE IF NOT EXISTS 'FISICA_ACTIVIDAD_EMPRESARIAL';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Postgres no permite quitar un valor de un enum: se pasan esos socios a FISICA y se recrea el tipo
    await queryRunner.query(
      `UPDATE "socios" SET "tipo_persona" = 'FISICA' WHERE "tipo_persona" = 'FISICA_ACTIVIDAD_EMPRESARIAL';`,
    );
    await queryRunner.query(`ALTER TABLE "socios" ALTER COLUMN "tipo_persona" DROP DEFAULT;`);
    await queryRunner.query(`ALTER TYPE "socios_tipo_persona_enum" RENAME TO "socios_tipo_persona_enum_old";`);
    await queryRunner.query(`CREATE TYPE "socios_tipo_persona_enum" AS ENUM ('FISICA', 'MORAL');`);
    await queryRunner.query(
      `ALTER TABLE "socios" ALTER COLUMN "tipo_persona" TYPE "socios_tipo_persona_enum" USING "tipo_persona"::text::"socios_tipo_persona_enum";`,
    );
    await queryRunner.query(`ALTER TABLE "socios" ALTER COLUMN "tipo_persona" SET DEFAULT 'FISICA';`);
    await queryRunner.query(`DROP TYPE "socios_tipo_persona_enum_old";`);
  }
}
