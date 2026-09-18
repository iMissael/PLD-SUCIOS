import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { Socio, TipoPersona, EstatusSocio, NivelRiesgo } from '../socios/entities/socio.entity';
import {
  PersonaRelacionada,
  TipoRelacion,
} from '../personas-relacionadas/entities/persona-relacionada.entity';

config();

/**
 * Seed de datos de prueba: 5 usuarios, 25 socios variados y sus
 * personas relacionadas (aval/cónyuge/representante legal/beneficiario).
 *
 * Uso: pnpm run seed:data
 *
 * Es idempotente a nivel "todo o nada": si ya existen socios, no vuelve
 * a insertar (evita duplicar datos si lo corres dos veces).
 */

function randomFrom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function fakeRfc(nombre: string, apellido: string, idx: number): string {
  const letras = (nombre[0] + apellido[0] + apellido[1]).toUpperCase();
  return `${letras}${String(800000 + idx).padStart(6, '0')}XX${idx % 10}`;
}

function fakeCurp(nombre: string, apellido: string, idx: number): string {
  const letras = (apellido[0] + nombre[0] + apellido[1] + nombre[1]).toUpperCase();
  return `${letras}${String(900000 + idx).padStart(6, '0')}HDFXXX0${idx % 10}`;
}

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5544),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgrespassword',
    database: process.env.DB_NAME ?? 'socios_db',
    entities: [Usuario, Socio, PersonaRelacionada],
  });

  await dataSource.initialize();

  const usuariosRepo = dataSource.getRepository(Usuario);
  const sociosRepo = dataSource.getRepository(Socio);
  const personasRepo = dataSource.getRepository(PersonaRelacionada);

  // --- Usuarios ---
  const socioCountExistente = await sociosRepo.count();
  if (socioCountExistente > 0) {
    console.log(
      `Ya existen ${socioCountExistente} socios en la base. No se vuelve a sembrar (evita duplicados).`,
    );
    await dataSource.destroy();
    return;
  }

  const usuariosDef = [
    { nombre: 'Admin de pruebas', email: 'admin@socios-service.local', rol: RolUsuario.ADMIN, password: 'Admin123!' },
    { nombre: 'Ana Torres', email: 'ana.torres@socios-service.local', rol: RolUsuario.ANALISTA, password: 'Analista123!' },
    { nombre: 'Luis Fernández', email: 'luis.fernandez@socios-service.local', rol: RolUsuario.ANALISTA, password: 'Analista123!' },
    { nombre: 'Karla Mendoza', email: 'karla.mendoza@socios-service.local', rol: RolUsuario.CONSULTA, password: 'Consulta123!' },
    { nombre: 'Jorge Ramírez', email: 'jorge.ramirez@socios-service.local', rol: RolUsuario.CONSULTA, password: 'Consulta123!' },
  ];

  for (const u of usuariosDef) {
    const existente = await usuariosRepo.findOne({ where: { email: u.email } });
    if (existente) continue;
    const passwordHash = await bcrypt.hash(u.password, 10);
    await usuariosRepo.save(
      usuariosRepo.create({ nombre: u.nombre, email: u.email, passwordHash, rol: u.rol }),
    );
  }
  console.log(`Usuarios listos (${usuariosDef.length}):`);
  usuariosDef.forEach((u) => console.log(`  ${u.email} / ${u.password} (${u.rol})`));

  // --- Datos base para variar los socios ---
  const nombresFisica: [string, string, string][] = [
    ['María', 'González', 'Pérez'],
    ['Juan', 'Ramírez', 'López'],
    ['Sofía', 'Hernández', 'Torres'],
    ['Carlos', 'Martínez', 'Sánchez'],
    ['Laura', 'García', 'Flores'],
    ['Miguel', 'Rodríguez', 'Cruz'],
    ['Daniela', 'López', 'Morales'],
    ['Fernando', 'Díaz', 'Reyes'],
    ['Andrea', 'Vázquez', 'Jiménez'],
    ['Ricardo', 'Ortiz', 'Gómez'],
    ['Paola', 'Castillo', 'Vargas'],
    ['Alejandro', 'Romero', 'Chávez'],
    ['Valeria', 'Mendoza', 'Ríos'],
    ['Emilio', 'Guzmán', 'Aguilar'],
    ['Gabriela', 'Moreno', 'Salazar'],
    ['Héctor', 'Núñez', 'Domínguez'],
    ['Renata', 'Cabrera', 'Delgado'],
  ];

  const razonesSociales: string[] = [
    'Comercializadora del Bajío S.A. de C.V.',
    'Grupo Industrial Peninsular S.A. de C.V.',
    'Servicios Logísticos del Norte S. de R.L.',
    'Constructora Altiplano S.A. de C.V.',
    'Tecnología y Soluciones Sureste S.A.P.I.',
    'Distribuidora Occidental S.A. de C.V.',
    'Agroindustrias del Golfo S. de R.L.',
    'Inmobiliaria Costa Pacífico S.A. de C.V.',
  ];

  const entidades = [
    'Ciudad de México', 'Jalisco', 'Nuevo León', 'Puebla', 'Guanajuato',
    'Yucatán', 'Sonora', 'Chiapas', 'Querétaro', 'Veracruz',
  ];
  const zonasGeograficas = ['Centro', 'Occidente', 'Noreste', 'Noroeste', 'Sureste', 'Bajío'];
  const localidadesPorEntidad: Record<string, string> = {
    'Ciudad de México': 'Benito Juárez',
    Jalisco: 'Zapopan',
    'Nuevo León': 'San Pedro Garza García',
    Puebla: 'Puebla de Zaragoza',
    Guanajuato: 'León',
    Yucatán: 'Mérida',
    Sonora: 'Hermosillo',
    Chiapas: 'Tuxtla Gutiérrez',
    Querétaro: 'Santiago de Querétaro',
    Veracruz: 'Xalapa',
  };
  const actividadesEconomicasFisica = [
    'Comercio al por menor', 'Servicios profesionales', 'Transporte de carga',
    'Restaurantero', 'Consultoría', 'Agricultura', 'Construcción', 'Tecnología',
  ];
  const actividadesEconomicasMoral = [
    'Comercio al por mayor', 'Servicios financieros', 'Manufactura',
    'Bienes raíces', 'Logística', 'Agroindustria', 'Construcción', 'Tecnología',
  ];
  const nivelesRiesgo = [NivelRiesgo.BAJO, NivelRiesgo.MEDIO, NivelRiesgo.ALTO];
  const origenesRecursos = [
    'Sueldos y salarios', 'Actividad empresarial', 'Honorarios profesionales',
    'Arrendamiento de inmuebles', 'Venta de bienes', 'Dividendos',
  ];
  const destinosRecursos = [
    'Gastos personales y familiares', 'Reinversión en el negocio',
    'Ahorro e inversión', 'Adquisición de bienes', 'Capital de trabajo',
  ];

  const socios: Socio[] = [];

  // 17 personas físicas
  nombresFisica.forEach(([nombre, apellidoPaterno, apellidoMaterno], i) => {
    const entidad = randomFrom(entidades, i);
    const esPep = i === 3 || i === 11; // un par marcados como PEP
    socios.push(
      sociosRepo.create({
        tipoPersona: TipoPersona.FISICA,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        rfc: fakeRfc(nombre, apellidoPaterno, i),
        curp: fakeCurp(nombre, apellidoPaterno, i),
        fechaNacimiento: `19${60 + (i % 35)}-0${(i % 9) + 1}-1${i % 9}`,
        nacionalidad: 'Mexicana',
        zonaGeografica: randomFrom(zonasGeograficas, i),
        pais: 'México',
        localidad: localidadesPorEntidad[entidad],
        entidad,
        experienciaActividad: 1 + (i % 20),
        actividadEconomica: randomFrom(actividadesEconomicasFisica, i),
        domicilio: `Calle ${10 + i} #${100 + i}, Col. Centro`,
        telefono: `55${String(10000000 + i * 137).slice(0, 8)}`,
        email: `${nombre.toLowerCase()}.${apellidoPaterno.toLowerCase()}@correo-prueba.com`,
        estatus: i % 9 === 0 ? EstatusSocio.INACTIVO : EstatusSocio.ACTIVO,
        nivelRiesgo: randomFrom(nivelesRiesgo, i),
        esPep,
        tieneHistorial: i % 2 === 0,
        origenRecursos: randomFrom(origenesRecursos, i),
        destinoRecursos: randomFrom(destinosRecursos, i),
      }),
    );
  });

  // 8 personas morales
  razonesSociales.forEach((razonSocial, i) => {
    const idx = i + 100;
    const entidad = randomFrom(entidades, idx);
    socios.push(
      sociosRepo.create({
        tipoPersona: TipoPersona.MORAL,
        nombre: razonSocial,
        rfc: `${razonSocial.replace(/[^A-Z]/g, '').slice(0, 3)}${String(900000 + i).padStart(6, '0')}XX${i}`,
        nacionalidad: 'Mexicana',
        zonaGeografica: randomFrom(zonasGeograficas, idx),
        pais: 'México',
        localidad: localidadesPorEntidad[entidad],
        entidad,
        tiempoConstitucion: 1 + (i % 25),
        actividadEconomica: randomFrom(actividadesEconomicasMoral, idx),
        domicilio: `Av. Industria ${200 + i}, Parque Industrial`,
        telefono: `81${String(20000000 + i * 219).slice(0, 8)}`,
        email: `contacto@${razonSocial.split(' ')[0].toLowerCase()}.com.mx`,
        estatus: EstatusSocio.ACTIVO,
        nivelRiesgo: randomFrom(nivelesRiesgo, idx),
        esPep: false,
        tieneHistorial: i % 3 !== 0,
        origenRecursos: 'Ingresos por actividad empresarial',
        destinoRecursos: 'Capital de trabajo y reinversión',
      }),
    );
  });

  const sociosGuardados = await sociosRepo.save(socios);
  console.log(`Socios creados: ${sociosGuardados.length}`);

  // --- Personas relacionadas ---
  const personas: PersonaRelacionada[] = [];
  const nombresRelacionados: [string, string, string][] = [
    ['Rosa', 'Jiménez', 'Vega'],
    ['Pedro', 'Aguilar', 'Soto'],
    ['Elena', 'Campos', 'Rivas'],
    ['Raúl', 'Medina', 'Nava'],
    ['Cecilia', 'Rosales', 'Ibarra'],
    ['Arturo', 'Solís', 'Peña'],
  ];

  sociosGuardados.forEach((socio, i) => {
    if (socio.tipoPersona === TipoPersona.FISICA) {
      // A la mitad de las personas físicas les damos aval y/o cónyuge
      if (i % 2 === 0) {
        const [nombre, apellidoPaterno, apellidoMaterno] = randomFrom(nombresRelacionados, i);
        personas.push(
          personasRepo.create({
            socioId: socio.id,
            tipoRelacion: TipoRelacion.AVAL,
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            rfc: fakeRfc(nombre, apellidoPaterno, i + 200),
            parentesco: 'No familiar',
            telefono: `55${String(30000000 + i * 91).slice(0, 8)}`,
          }),
        );
      }
      if (i % 3 === 0) {
        const [nombre, apellidoPaterno, apellidoMaterno] = randomFrom(nombresRelacionados, i + 1);
        personas.push(
          personasRepo.create({
            socioId: socio.id,
            tipoRelacion: TipoRelacion.CONYUGE,
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            rfc: fakeRfc(nombre, apellidoPaterno, i + 300),
            parentesco: 'Cónyuge',
          }),
        );
      }
    } else {
      // Personas morales: representante legal siempre, beneficiario controlador a veces
      const [nombreRL, apPaternoRL, apMaternoRL] = randomFrom(nombresRelacionados, i);
      personas.push(
        personasRepo.create({
          socioId: socio.id,
          tipoRelacion: TipoRelacion.REPRESENTANTE_LEGAL,
          nombre: nombreRL,
          apellidoPaterno: apPaternoRL,
          apellidoMaterno: apMaternoRL,
          rfc: fakeRfc(nombreRL, apPaternoRL, i + 400),
          parentesco: 'N/A',
        }),
      );
      if (i % 2 === 0) {
        const [nombreBC, apPaternoBC, apMaternoBC] = randomFrom(nombresRelacionados, i + 2);
        personas.push(
          personasRepo.create({
            socioId: socio.id,
            tipoRelacion: TipoRelacion.BENEFICIARIO_CONTROLADOR,
            nombre: nombreBC,
            apellidoPaterno: apPaternoBC,
            apellidoMaterno: apMaternoBC,
            rfc: fakeRfc(nombreBC, apPaternoBC, i + 500),
            parentesco: 'N/A',
          }),
        );
      }
    }
  });

  await personasRepo.save(personas);
  console.log(`Personas relacionadas creadas: ${personas.length}`);

  await dataSource.destroy();
  console.log('Seed de datos completo.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
