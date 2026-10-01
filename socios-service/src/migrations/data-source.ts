import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Socio } from '../socios/entities/socio.entity';
import { PersonaRelacionada } from '../personas-relacionadas/entities/persona-relacionada.entity';
import { CreateInitialTables1758170000000 } from './1758170000000-CreateInitialTables';
import { DomicilioDesglosadoYCurpUsuarios1759260000000 } from './1759260000000-DomicilioDesglosadoYCurpUsuarios';

config();

// DataSource exclusivo para el CLI de TypeORM (migration:generate/run/revert).
// No se usa en tiempo de ejecución de la app (eso lo maneja app.module.ts).
//
// IMPORTANTE: se listan las entidades y migraciones como clases importadas
// directamente, NO como patrones glob de string (ej. 'src/**/*.entity.ts').
// Con ts-node + pnpm, el DirectoryExportedClassesLoader interno de TypeORM
// que resuelve esos globs puede entrar en recursión infinita
// ("Maximum call stack size exceeded") por cómo pnpm arma node_modules con
// symlinks. Importar las clases directamente evita ese loader por completo.
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5544),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgrespassword',
  database: process.env.DB_NAME ?? 'socios_db',
  entities: [Usuario, Socio, PersonaRelacionada],
  migrations: [CreateInitialTables1758170000000, DomicilioDesglosadoYCurpUsuarios1759260000000],
});
