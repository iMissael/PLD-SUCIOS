import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuarios/entities/usuario.entity';
import { Socio } from './socios/entities/socio.entity';
import { PersonaRelacionada } from './personas-relacionadas/entities/persona-relacionada.entity';
import { UsuariosModule } from './usuarios/usuarios.module';
import { SociosModule } from './socios/socios.module';
import { PersonasRelacionadasModule } from './personas-relacionadas/personas-relacionadas.module';
import { AuthModule } from './auth/auth.module';
import { MIGRACIONES } from './migrations';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5433),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgrespassword',
      database: process.env.DB_NAME ?? 'socios_db',
      entities: [Usuario, Socio, PersonaRelacionada],
      // Nunca auto-sync (evita migraciones destructivas generadas automáticamente);
      // las migraciones escritas a mano se aplican al arrancar.
      synchronize: false,
      migrations: MIGRACIONES,
      migrationsRun: true,
    }),
    UsuariosModule,
    SociosModule,
    PersonasRelacionadasModule,
    AuthModule,
  ],
})
export class AppModule {}
