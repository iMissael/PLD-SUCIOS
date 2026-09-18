import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { Socio } from '../socios/entities/socio.entity';
import { PersonaRelacionada } from '../personas-relacionadas/entities/persona-relacionada.entity';

config();

// Script de conveniencia para crear un usuario ADMIN de prueba.
// Uso: pnpm run seed:admin
async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5433),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgrespassword',
    database: process.env.DB_NAME ?? 'socios_db',
    entities: [Usuario, Socio, PersonaRelacionada],
  });

  await dataSource.initialize();
  const repo = dataSource.getRepository(Usuario);

  const email = 'admin@socios-service.local';
  const existente = await repo.findOne({ where: { email } });
  if (existente) {
    console.log('El usuario admin de prueba ya existe:', email);
    await dataSource.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const admin = repo.create({
    nombre: 'Admin de pruebas',
    email,
    passwordHash,
    rol: RolUsuario.ADMIN,
  });
  await repo.save(admin);

  console.log('Usuario admin creado:');
  console.log('  email:', email);
  console.log('  password: Admin123!');

  await dataSource.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
