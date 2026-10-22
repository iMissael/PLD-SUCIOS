import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import {
  Acreditado,
  EstatusAcreditado,
  NivelRiesgo,
  TipoPersona,
} from '../acreditados/entities/acreditado.entity';
import {
  PersonaRelacionada,
  TipoRelacion,
} from '../personas-relacionadas/entities/persona-relacionada.entity';
import { digitoVerificadorCurp } from '../common/curp/curp';

config();

/**
 * Seed de datos de prueba: 5 usuarios, acreditados variados y sus
 * personas relacionadas (aval/cónyuge/representante legal/beneficiario).
 *
 * Uso: pnpm run seed:data
 *
 * Es idempotente a nivel acreditados: conserva los registros existentes y
 * asegura los tres acreditados de integración con sus datos actualizados.
 */

function randomFrom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function rfcDeCurp(curp: string, idx: number): string {
  return `${curp.slice(0, 10)}XX${idx % 10}`;
}

function fakeRfc(nombre: string, apellido: string, idx: number): string {
  const letras = (nombre[0] + apellido[0] + apellido[1]).toUpperCase();
  return `${letras}${String(800000 + idx).padStart(6, '0')}XX${idx % 10}`;
}

/**
 * Acreditados para probar las alertas inusuales de la Matriz PLD. Cada uno está pensado para una
 * regla (ver `escenario`); las alertas se disparan al mandar operaciones de caja con su referencia.
 * Los de listas bloqueadas coinciden con las personas sembradas en public.persona_bloqueada.
 */
interface AcreditadoPrueba {
  codigo: string;
  escenario: string;
  tipoPersona: TipoPersona;
  nombre: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  rfc: string;
  curp?: string;
  fechaNacimiento: string;
  nacionalidad?: string;
  paisNacimiento?: string;
  actividadEconomica: string;
  fechaInicioActividad: string;
  localidadId: number;
  municipio: string;
  entidad: string;
  credito: { tipoCreditoId: number; monto: number; origenRecursosId: number; destinoRecursosId: number; canalPagoId: number };
}

function acreditadoPrueba(a: AcreditadoPrueba) {
  const { escenario: _escenario, credito, localidadId, municipio, entidad, ...datos } = a;
  return {
    apellidoPaterno: '',
    apellidoMaterno: '',
    curp: '',
    nacionalidad: 'MEXICANA',
    paisNacimiento: 'MEXICO',
    ...datos,
    creditoSolicitado: { referencia: `CRED-${a.codigo}`, ...credito },
    historialCrediticio: [],
    estatus: EstatusAcreditado.ACTIVO,
    domicilio: {
      localidadId,
      calle: 'AVENIDA JUAREZ',
      numeroExterior: String(100 + Number(a.codigo.slice(-2))),
      colonia: 'CENTRO',
      municipio,
      entidad,
      pais: 'MEXICO',
    },
  };
}

const acreditadosAlertasInusuales = [
  // --- Listas bloqueadas (regla 15, razón XIII) ---
  acreditadoPrueba({
    codigo: 'CLI-910', escenario: 'Lista bloqueada SAT: coincide exacto (RFC/CURP) con FELICIANA CANTÓN AMAYA',
    tipoPersona: TipoPersona.FISICA, nombre: 'FELICIANA', apellidoPaterno: 'CANTÓN', apellidoMaterno: 'AMAYA',
    rfc: 'CAAF910223Y6D', curp: 'FACA910223HNLAJI1', fechaNacimiento: '1991-02-23',
    actividadEconomica: '6400006', fechaInicioActividad: '2016-05-01',
    localidadId: 201945, municipio: 'SAN PEDRO GARZA GARCIA', entidad: 'NUEVO LEON',
    credito: { tipoCreditoId: 2, monto: 250000, origenRecursosId: 2, destinoRecursosId: 2, canalPagoId: 1 },
  }),
  acreditadoPrueba({
    codigo: 'CLI-911', escenario: 'Lista bloqueada PEP: coincide con TELMO ANTÓN ANDRÉS',
    tipoPersona: TipoPersona.FISICA, nombre: 'TELMO', apellidoPaterno: 'ANTÓN', apellidoMaterno: 'ANDRÉS',
    rfc: 'ANAT470122UZB', curp: 'TAAA470122HMOKW55', fechaNacimiento: '1947-01-22',
    actividadEconomica: '8400004', fechaInicioActividad: '1990-01-15',
    localidadId: 276407, municipio: 'HERMOSILLO', entidad: 'SONORA',
    credito: { tipoCreditoId: 3, monto: 400000, origenRecursosId: 1, destinoRecursosId: 1, canalPagoId: 2 },
  }),
  acreditadoPrueba({
    codigo: 'CLI-912', escenario: 'Lista bloqueada por alias: LEONARDO HIERRO GODOY es alias de FELICIANA CANTÓN AMAYA',
    tipoPersona: TipoPersona.FISICA, nombre: 'LEONARDO', apellidoPaterno: 'HIERRO', apellidoMaterno: 'GODOY',
    rfc: 'HIGL500307PQK', curp: 'LIHG500307HCASAH8', fechaNacimiento: '1950-03-07',
    actividadEconomica: '7129019', fechaInicioActividad: '2001-07-01',
    localidadId: 166401, municipio: 'ZAPOPAN', entidad: 'JALISCO',
    credito: { tipoCreditoId: 2, monto: 80000, origenRecursosId: 2, destinoRecursosId: 2, canalPagoId: 3 },
  }),
  acreditadoPrueba({
    codigo: 'CLI-913', escenario: 'Lista bloqueada BM y nacionalidad de país GAFI (Cuba): LEOPOLDO CORTÉS GARRIDO',
    tipoPersona: TipoPersona.FISICA, nombre: 'LEOPOLDO', apellidoPaterno: 'CORTÉS', apellidoMaterno: 'GARRIDO',
    rfc: 'COGL051027NVQ', curp: 'LOCG051027HCHW2P1', fechaNacimiento: '2005-10-27',
    nacionalidad: 'CUBANA', paisNacimiento: 'CUBA',
    actividadEconomica: '8700008', fechaInicioActividad: '2024-02-01',
    localidadId: 343187, municipio: 'MERIDA', entidad: 'YUCATAN',
    credito: { tipoCreditoId: 1, monto: 35000, origenRecursosId: 4, destinoRecursosId: 4, canalPagoId: 2 },
  }),
  acreditadoPrueba({
    codigo: 'CLI-914', escenario: 'Homónimo: mismo nombre que NOELIA CUERVO ROCAMORA pero otro RFC/CURP/fecha (el oficial descarta)',
    tipoPersona: TipoPersona.FISICA, nombre: 'NOELIA', apellidoPaterno: 'CUERVO', apellidoMaterno: 'ROCAMORA',
    rfc: 'CURN800101AB1', curp: 'CURN800101MDFRCL01', fechaNacimiento: '1980-01-01',
    actividadEconomica: '8400004', fechaInicioActividad: '2010-09-01',
    localidadId: 105249, municipio: 'BENITO JUAREZ', entidad: 'CIUDAD DE MEXICO',
    credito: { tipoCreditoId: 1, monto: 60000, origenRecursosId: 4, destinoRecursosId: 3, canalPagoId: 1 },
  }),
  // --- Montos (no están en listas): las alertas salen por el importe y la forma de pago ---
  acreditadoPrueba({
    codigo: 'CLI-915', escenario: 'Efectivo: depósitos de 300 mil y 500 mil pesos (reglas 5 y 7) y USD 500 en un movimiento (regla 6)',
    tipoPersona: TipoPersona.FISICA, nombre: 'ALBERTO', apellidoPaterno: 'MÁRQUEZ', apellidoMaterno: 'SOLÍS',
    rfc: 'MASA780910KJ2', curp: 'MASA780910HDFRLL04', fechaNacimiento: '1978-09-10',
    actividadEconomica: '6400006', fechaInicioActividad: '2008-03-01',
    localidadId: 228187, municipio: 'PUEBLA', entidad: 'PUEBLA',
    credito: { tipoCreditoId: 3, monto: 900000, origenRecursosId: 5, destinoRecursosId: 2, canalPagoId: 2 },
  }),
  acreditadoPrueba({
    codigo: 'CLI-916', escenario: 'Fraccionadas: varios pagos en USD que suman más de 7,500 (regla 3) y en distintas sucursales (regla 16)',
    tipoPersona: TipoPersona.FISICA, nombre: 'PATRICIA', apellidoPaterno: 'ROJAS', apellidoMaterno: 'IBARRA',
    rfc: 'ROIP850412TQ5', curp: 'ROIP850412MJCJBT03', fechaNacimiento: '1985-04-12',
    actividadEconomica: '8200008', fechaInicioActividad: '2012-11-01',
    localidadId: 122322, municipio: 'LEON', entidad: 'GUANAJUATO',
    credito: { tipoCreditoId: 2, monto: 1500000, origenRecursosId: 2, destinoRecursosId: 2, canalPagoId: 1 },
  }),
  acreditadoPrueba({
    codigo: 'CLI-917', escenario: 'Persona moral: operaciones grandes en efectivo y con país de régimen fiscal preferente (regla 17)',
    tipoPersona: TipoPersona.MORAL, nombre: 'IMPORTADORA DEL PACÍFICO S.A. DE C.V.',
    rfc: 'IPA120601HT7', fechaNacimiento: '2012-06-01',
    actividadEconomica: '6600002', fechaInicioActividad: '2012-06-01',
    localidadId: 319718, municipio: 'XALAPA', entidad: 'VERACRUZ',
    credito: { tipoCreditoId: 3, monto: 2500000, origenRecursosId: 5, destinoRecursosId: 2, canalPagoId: 1 },
  }),
  acreditadoPrueba({
    codigo: 'CLI-918', escenario: 'País: operaciones con país no cooperante GAFI (regla 18) o paraíso fiscal (regla 17)',
    tipoPersona: TipoPersona.FISICA, nombre: 'RICARDO', apellidoPaterno: 'SALAZAR', apellidoMaterno: 'VEGA',
    rfc: 'SAVR820315PL8', curp: 'SAVR820315HQTLGC02', fechaNacimiento: '1982-03-15',
    actividadEconomica: '7400005', fechaInicioActividad: '2009-01-01',
    localidadId: 235061, municipio: 'SANTIAGO DE QUERETARO', entidad: 'QUERETARO',
    credito: { tipoCreditoId: 2, monto: 750000, origenRecursosId: 2, destinoRecursosId: 2, canalPagoId: 1 },
  }),
  acreditadoPrueba({
    codigo: 'CLI-919', escenario: 'Extranjera de paraíso fiscal (Costa Rica): incidencia de riesgo-país al escanear',
    tipoPersona: TipoPersona.FISICA, nombre: 'ANA LUCÍA', apellidoPaterno: 'BERMÚDEZ', apellidoMaterno: 'PRIETO',
    rfc: 'BEPA900720XY1', fechaNacimiento: '1990-07-20',
    nacionalidad: 'COSTARRICENSE', paisNacimiento: 'COSTA RICA',
    actividadEconomica: '8400004', fechaInicioActividad: '2018-04-01',
    localidadId: 71327, municipio: 'TUXTLA GUTIERREZ', entidad: 'CHIAPAS',
    credito: { tipoCreditoId: 1, monto: 15000, origenRecursosId: 4, destinoRecursosId: 4, canalPagoId: 3 },
  }),
];

const acreditadosIntegracion = [
  {
    codigo: 'CLI-900',
    tipoPersona: TipoPersona.FISICA,
    nombre: 'JUAN',
    apellidoPaterno: 'PEREZ',
    apellidoMaterno: 'LOPEZ',
    rfc: 'PELJ850101AB1',
    curp: 'PELJ850101HDFRPN09',
    fechaNacimiento: '1985-01-01',
    paisNacimiento: 'MEXICO',
    nacionalidad: 'MEXICANA',
    actividadEconomica: '100008',
    fechaInicioActividad: '2015-03-01',
    creditoSolicitado: {
      referencia: 'CRED-0001',
      tipoCreditoId: 2,
      monto: 150000,
      origenRecursosId: 2,
      destinoRecursosId: 2,
      canalPagoId: 1,
    },
    historialCrediticio: [
      {
        referencia: 'CRED-0000',
        tipoCreditoId: 1,
        monto: 20000,
        fechaOtorgamiento: '2023-02-10',
        estatus: 'PAGADO',
      },
    ],
    estatus: EstatusAcreditado.ACTIVO,
    domicilio: {
      localidadId: 105250, // CUAUHTEMOC, CDMX
      calle: 'REFORMA',
      numeroExterior: '100',
      numeroInterior: '2',
      colonia: 'CENTRO',
      codigoPostal: '06000',
      municipio: 'CUAUHTEMOC',
      entidad: 'CDMX',
      pais: 'MEXICO',
    },
  },
  {
    codigo: 'CLI-901',
    tipoPersona: TipoPersona.FISICA,
    nombre: 'RODRIGO',
    apellidoPaterno: 'VILLASEÑOR',
    apellidoMaterno: 'QUINTERO',
    rfc: 'VIQR780213AB1',
    curp: 'VIQR780213HDFLLR05',
    fechaNacimiento: '1978-02-13',
    paisNacimiento: 'MEXICO',
    nacionalidad: 'MEXICANA',
    actividadEconomica: '100008',
    fechaInicioActividad: '2015-03-01',
    creditoSolicitado: {
      referencia: 'CRED-0901',
      tipoCreditoId: 3,
      monto: 400000,
      origenRecursosId: 2,
      destinoRecursosId: 2,
      canalPagoId: 2,
    },
    historialCrediticio: [],
    estatus: EstatusAcreditado.ACTIVO,
    domicilio: {
      localidadId: 105250, // CUAUHTEMOC, CDMX
      calle: 'CALLE 5 DE MAYO',
      numeroExterior: '420',
      colonia: 'CENTRO',
      codigoPostal: '06000',
      municipio: 'CUAUHTEMOC',
      entidad: 'CDMX',
      pais: 'MEXICO',
    },
  },
  {
    codigo: 'CLI-902',
    tipoPersona: TipoPersona.MORAL,
    nombre: 'MEXICO SOLUCIONES S.A. DE C.V.',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rfc: 'MSSC980101QW1',
    curp: '',
    fechaNacimiento: '1998-01-01',
    paisNacimiento: 'MEXICO',
    nacionalidad: 'MEXICANA',
    actividadEconomica: '6600002', // COMPRAVENTA DE MATERIAS PRIMAS, MATERIALES Y AUXILIARES
    fechaInicioActividad: '2015-03-01',
    creditoSolicitado: {
      referencia: 'CRED-0902',
      tipoCreditoId: 2,
      monto: 750000,
      origenRecursosId: 5,
      destinoRecursosId: 2,
      canalPagoId: 1,
    },
    historialCrediticio: [],
    estatus: EstatusAcreditado.INACTIVO,
    domicilio: {
      localidadId: 105250, // CUAUHTEMOC, CDMX
      calle: 'AVENIDA INSURGENTES',
      numeroExterior: '1200',
      colonia: 'JUAREZ',
      codigoPostal: '06600',
      municipio: 'CUAUHTEMOC',
      entidad: 'CDMX',
      pais: 'MEXICO',
    },
  },
  ...acreditadosAlertasInusuales,
];

function fechaInicioActividadDesdeAntiguedad(
  fechaReferencia: string,
  antiguedad: number,
): string {
  const fecha = new Date(`${fechaReferencia}T00:00:00Z`);
  fecha.setUTCFullYear(fecha.getUTCFullYear() - antiguedad);
  return fecha.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Datos que la Matriz PLD necesita para evaluar sin capturar nada a mano.
// Las claves e ids son los de sus catálogos (cat_actividad_economica.clave_sat,
// cat_localidad.id, cat_tipo_credito, cat_origen_recurso, cat_destino_recurso,
// cat_canal_pago).
// ---------------------------------------------------------------------------

/** Actividad en texto → clave SAT de cat_actividad_economica. */
const CLAVE_SAT_ACTIVIDAD: Record<string, string> = {
  AGRICULTURA: '100008',
  AGROINDUSTRIA: '2000008', // FABRICACIÓN DE ALIMENTOS
  'BIENES RAICES': '8300006', // SERVICIOS RELACIONADOS CON INMUEBLES
  'COMERCIO AL POR MAYOR': '6600002', // COMPRAVENTA DE MATERIAS PRIMAS, MATERIALES Y AUXILIARES
  'COMERCIO AL POR MENOR': '6400006', // COMPRAVENTA EN TIENDAS DE AUTOSERVICIO Y DEPARTAMENTALES
  CONSTRUCCION: '4100004', // CONTRATACIÓN DE OBRAS COMPLETAS DE CONSTRUCCIÓN
  CONSULTORIA: '8400004', // SERVICIOS PROFESIONALES Y TÉCNICOS
  LOGISTICA: '7400005', // SERVICIOS CONEXOS AL TRANSPORTE
  MANUFACTURA: '3900009', // OTRAS INDUSTRIAS MANUFACTURERAS
  RESTAURANTERO: '8700008', // PREPARACIÓN Y SERVICIO DE ALIMENTOS Y BEBIDAS
  'SERVICIOS FINANCIEROS': '8200008', // SERVICIOS COLATERALES A INSTITUCIONES FINANCIERAS
  'SERVICIOS PROFESIONALES': '8400004', // SERVICIOS PROFESIONALES Y TÉCNICOS
  TECNOLOGIA: '8400004', // SERVICIOS PROFESIONALES Y TÉCNICOS
  'TRANSPORTE DE CARGA': '7129019', // TRANSPORTE DE CARGA FORÁNEA
};

function sinAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
}

/** Claves que están dadas de baja en la Matriz (estatus B) → la que las reemplaza. */
const CLAVE_SAT_REEMPLAZO: Record<string, string> = {
  '8400002': '8400004', // ASESORES FISCALES Y FINANCIEROS → SERVICIOS PROFESIONALES Y TÉCNICOS
};

/** Si ya es clave SAT (solo dígitos) se deja igual, salvo que esté dada de baja. */
function claveActividad(actividad?: string): string | undefined {
  if (!actividad) return actividad;
  const valor = actividad.trim();
  if (/^\d+$/.test(valor)) return CLAVE_SAT_REEMPLAZO[valor] ?? valor;
  return CLAVE_SAT_ACTIVIDAD[sinAcentos(valor)] ?? valor;
}

/** Entidad → id de cat_localidad de la ciudad que usa el seed en esa entidad. */
const LOCALIDAD_ID_POR_ENTIDAD: Record<string, number> = {
  'CIUDAD DE MEXICO': 105249, // BENITO JUAREZ
  CDMX: 105250, // CUAUHTEMOC (acreditados de integración)
  JALISCO: 166401, // ZAPOPAN
  'NUEVO LEON': 201945, // SAN PEDRO GARZA GARCIA
  PUEBLA: 228187, // HEROICA PUEBLA DE ZARAGOZA
  GUANAJUATO: 122322, // LEON DE LOS ALDAMA
  YUCATAN: 343187, // MERIDA
  SONORA: 276407, // HERMOSILLO
  CHIAPAS: 71327, // TUXTLA GUTIERREZ
  QUERETARO: 235061, // SANTIAGO DE QUERETARO
  VERACRUZ: 319718, // XALAPA-ENRIQUEZ
};

function localidadIdDe(entidad?: string): number | undefined {
  return entidad ? LOCALIDAD_ID_POR_ENTIDAD[sinAcentos(entidad)] : undefined;
}

// cat_tipo_credito: 1 CREDINOMINA INTELIGENTE (solo física, 3 mil a 100 mil),
// 2 FRANQUIFONDO (5 mil a 20 millones), 3 CREDIPLUS (100 mil a 5 millones).
const MONTOS_POR_TIPO_CREDITO: Record<number, number[]> = {
  1: [15000, 35000, 60000, 95000],
  2: [80000, 250000, 750000, 1500000],
  3: [150000, 400000, 900000, 2500000],
};

/** Crédito que se evalúa; los ids son de cat_origen_recurso (1-5), cat_destino_recurso (1-4) y cat_canal_pago (1-3). */
function creditoDePrueba(i: number, codigo: string, moral: boolean) {
  const tipoCreditoId = moral ? 2 + (i % 2) : 1 + (i % 3);
  return {
    referencia: `CRED-${codigo}`,
    tipoCreditoId,
    monto: randomFrom(MONTOS_POR_TIPO_CREDITO[tipoCreditoId], i),
    origenRecursosId: moral ? 2 + (i % 2) * 3 : 1 + (i % 5), // morales: Capital de Trabajo o Compra de mercancía
    destinoRecursosId: moral ? 2 : 1 + (i % 4),
    canalPagoId: 1 + (i % 3),
  };
}

function historialDePrueba(i: number, codigo: string) {
  const historial = [
    {
      referencia: `CRED-${codigo}-H1`,
      tipoCreditoId: 1,
      monto: 20000 + (i % 5) * 5000,
      fechaOtorgamiento: `${2019 + (i % 4)}-0${1 + (i % 9)}-15`,
      estatus: 'PAGADO',
    },
  ];
  if (i % 3 === 0) {
    historial.push({
      referencia: `CRED-${codigo}-H2`,
      tipoCreditoId: 3,
      monto: 120000 + (i % 4) * 30000,
      fechaOtorgamiento: '2024-06-01',
      estatus: 'VIGENTE',
    });
  }
  return historial;
}

/**
 * Completa lo que la Matriz necesita para evaluar: actividad como clave SAT,
 * localidad del domicilio, fecha de constitución en morales, crédito solicitado
 * e historial. Solo llena lo que falta; no pisa lo que ya tenga el acreditado.
 */
function completarParaEvaluacion(acreditado: Acreditado, i: number): Acreditado {
  const moral = acreditado.tipoPersona === TipoPersona.MORAL;
  const hoy = new Date().toISOString().slice(0, 10);

  acreditado.actividadEconomica = claveActividad(acreditado.actividadEconomica);
  acreditado.paisNacimiento ??= 'MEXICO';
  acreditado.fechaInicioActividad ??= fechaInicioActividadDesdeAntiguedad(
    acreditado.fechaAlta ?? hoy,
    acreditado.experienciaActividad ?? acreditado.tiempoConstitucion ?? 1,
  );
  // En morales fechaNacimiento es la fecha de constitución.
  if (moral) acreditado.fechaNacimiento ??= acreditado.fechaInicioActividad;

  acreditado.domicilio ??= {};
  acreditado.domicilio.localidadId ??= localidadIdDe(acreditado.domicilio.entidad ?? acreditado.entidad);

  acreditado.creditoSolicitado ??= creditoDePrueba(i, acreditado.codigo, moral);
  if (acreditado.tieneHistorial) acreditado.historialCrediticio ??= historialDePrueba(i, acreditado.codigo);
  acreditado.historialCrediticio ??= [];
  return acreditado;
}

const CLAVE_ENTIDAD_CURP: Record<string, string> = {
  'Ciudad de México': 'DF',
  Jalisco: 'JC',
  'Nuevo León': 'NL',
  Puebla: 'PL',
  Guanajuato: 'GT',
  Yucatán: 'YN',
  Sonora: 'SR',
  Chiapas: 'CS',
  Querétaro: 'QT',
  Veracruz: 'VZ',
};

// Mayúsculas, sin acentos; la Ñ se sustituye por X como hace RENAPO.
function normalizar(texto: string): string {
  return texto
    .toUpperCase()
    .replace(/Ñ/g, 'X')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z ]/g, '');
}

function primeraInterna(palabra: string, patron: RegExp): string {
  return palabra.slice(1).match(patron)?.[0] ?? 'X';
}

/**
 * CURP con la estructura real (iniciales, fecha, sexo, entidad, consonantes
 * internas, homoclave y dígito verificador correcto). Simplificada: no
 * aplica la lista de palabras altisonantes ni partículas (DE, DEL, ...).
 */
function generarCurp(p: {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string; // YYYY-MM-DD
  sexo: 'H' | 'M';
  entidad: string;
}): string {
  const paterno = normalizar(p.apellidoPaterno);
  const materno = normalizar(p.apellidoMaterno ?? '');
  // En nombres compuestos se ignoran JOSE y MARIA
  const nombres = normalizar(p.nombre).split(' ').filter(Boolean);
  const nombre =
    nombres.length > 1 && ['JOSE', 'J', 'MARIA', 'MA'].includes(nombres[0]) ? nombres[1] : nombres[0];
  const [anio, mes, dia] = p.fechaNacimiento.split('-');
  const vocal = /[AEIOU]/;
  const consonante = /[B-DF-HJ-NP-TV-Z]/;

  const curp17 =
    paterno[0] +
    primeraInterna(paterno, vocal) +
    (materno[0] ?? 'X') +
    nombre[0] +
    anio.slice(2) +
    mes +
    dia +
    p.sexo +
    CLAVE_ENTIDAD_CURP[p.entidad] +
    primeraInterna(paterno, consonante) +
    primeraInterna(materno, consonante) +
    primeraInterna(nombre, consonante) +
    (Number(anio) < 2000 ? '0' : 'A');

  return curp17 + digitoVerificadorCurp(curp17);
}

const CODIGO_POSTAL_POR_ENTIDAD: Record<string, string> = {
  'Ciudad de México': '03100',
  Jalisco: '45100',
  'Nuevo León': '66220',
  Puebla: '72000',
  Guanajuato: '37000',
  Yucatán: '97000',
  Sonora: '83000',
  Chiapas: '29000',
  Querétaro: '76000',
  Veracruz: '91000',
};

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5544),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgrespassword',
    database: process.env.DB_NAME ?? 'socios_db',
    entities: [Usuario, Acreditado, PersonaRelacionada],
  });

  await dataSource.initialize();

  const usuariosRepo = dataSource.getRepository(Usuario);
  const acreditadosRepo = dataSource.getRepository(Acreditado);
  const personasRepo = dataSource.getRepository(PersonaRelacionada);

  // --- Usuarios ---
  // Los usuarios son los empleados: llevan CURP y domicilio (salvo el admin genérico).
  const usuariosDef = [
    { nombre: 'Admin de pruebas', email: 'admin@socios-service.local', rol: RolUsuario.ADMIN, password: 'Admin123!' },
    {
      nombre: 'Ana Torres', email: 'ana.torres@socios-service.local', rol: RolUsuario.ANALISTA, password: 'Analista123!',
      curp: { nombre: 'Ana', apellidoPaterno: 'Torres', apellidoMaterno: 'Luna', fechaNacimiento: '1990-04-12', sexo: 'M' as const, entidad: 'Jalisco' },
      domicilio: { calle: 'Av. Patria', numeroExterior: '1520', numeroInterior: '4B', colonia: 'Jardines Universidad', codigoPostal: '45110', municipio: 'Zapopan', entidad: 'Jalisco', pais: 'México' },
    },
    {
      nombre: 'Luis Fernández', email: 'luis.fernandez@socios-service.local', rol: RolUsuario.ANALISTA, password: 'Analista123!',
      curp: { nombre: 'Luis', apellidoPaterno: 'Fernández', apellidoMaterno: 'Ortega', fechaNacimiento: '1988-11-03', sexo: 'H' as const, entidad: 'Nuevo León' },
      domicilio: { calle: 'Calzada del Valle', numeroExterior: '310', colonia: 'Del Valle', codigoPostal: '66220', municipio: 'San Pedro Garza García', entidad: 'Nuevo León', pais: 'México' },
    },
    {
      nombre: 'Karla Mendoza', email: 'karla.mendoza@socios-service.local', rol: RolUsuario.CONSULTA, password: 'Consulta123!',
      curp: { nombre: 'Karla', apellidoPaterno: 'Mendoza', apellidoMaterno: 'Ruiz', fechaNacimiento: '1995-07-21', sexo: 'M' as const, entidad: 'Puebla' },
      domicilio: { calle: 'Calle 5 de Mayo', numeroExterior: '208', colonia: 'Centro', codigoPostal: '72000', municipio: 'Puebla', entidad: 'Puebla', pais: 'México' },
    },
    {
      nombre: 'Jorge Ramírez', email: 'jorge.ramirez@socios-service.local', rol: RolUsuario.CONSULTA, password: 'Consulta123!',
      curp: { nombre: 'Jorge', apellidoPaterno: 'Ramírez', apellidoMaterno: 'Soto', fechaNacimiento: '1985-02-28', sexo: 'H' as const, entidad: 'Ciudad de México' },
      domicilio: { calle: 'Insurgentes Sur', numeroExterior: '1605', numeroInterior: '301', colonia: 'San José Insurgentes', codigoPostal: '03900', municipio: 'Benito Juárez', entidad: 'Ciudad de México', pais: 'México' },
    },
  ];

  for (const [idx, u] of usuariosDef.entries()) {
    const curp = u.curp ? generarCurp(u.curp) : undefined;
    const rfc = curp ? rfcDeCurp(curp, idx) : undefined;
    const existente = await usuariosRepo.findOne({ where: { email: u.email } });
    if (existente) {
      if (curp && (!existente.curp || !existente.rfc)) {
        existente.curp = existente.curp ?? curp;
        existente.rfc = existente.rfc ?? rfcDeCurp(existente.curp, idx);
        await usuariosRepo.save(existente);
      }
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 10);
    await usuariosRepo.save(
      usuariosRepo.create({
        nombre: u.nombre,
        email: u.email,
        passwordHash,
        rol: u.rol,
        curp,
        rfc,
        domicilio: u.domicilio,
      }),
    );
  }
  console.log(`Usuarios listos (${usuariosDef.length}):`);
  usuariosDef.forEach((u) => console.log(`  ${u.email} / ${u.password} (${u.rol})`));

  const acreditadoCountExistente = await acreditadosRepo.count();
  if (acreditadoCountExistente > 0) {
    const existentes = await acreditadosRepo.find({ order: { codigo: 'ASC' } });
    for (const [i, existente] of existentes.entries()) {
      await acreditadosRepo.save(completarParaEvaluacion(existente, i));
    }

    for (const demo of acreditadosIntegracion) {
      const existente = await acreditadosRepo.findOne({
        where: { codigo: demo.codigo },
      });
      if (!existente) {
        await acreditadosRepo.save(acreditadosRepo.create(demo));
        continue;
      }
      Object.assign(existente, demo);
      await acreditadosRepo.save(existente);
    }
    console.log(
      `Ya existen ${acreditadoCountExistente} acreditados en la base. Se conservaron y se verificaron los datos de integración.`,
    );
    await dataSource.destroy();
    return;
  }

  // --- Datos base para variar los acreditados ---
  const nombresFisica: [string, string, string, 'H' | 'M'][] = [
    ['María', 'González', 'Pérez', 'M'],
    ['Juan', 'Ramírez', 'López', 'H'],
    ['Sofía', 'Hernández', 'Torres', 'M'],
    ['Carlos', 'Martínez', 'Sánchez', 'H'],
    ['Laura', 'García', 'Flores', 'M'],
    ['Miguel', 'Rodríguez', 'Cruz', 'H'],
    ['Daniela', 'López', 'Morales', 'M'],
    ['Fernando', 'Díaz', 'Reyes', 'H'],
    ['Andrea', 'Vázquez', 'Jiménez', 'M'],
    ['Ricardo', 'Ortiz', 'Gómez', 'H'],
    ['Paola', 'Castillo', 'Vargas', 'M'],
    ['Alejandro', 'Romero', 'Chávez', 'H'],
    ['Valeria', 'Mendoza', 'Ríos', 'M'],
    ['Emilio', 'Guzmán', 'Aguilar', 'H'],
    ['Gabriela', 'Moreno', 'Salazar', 'M'],
    ['Héctor', 'Núñez', 'Domínguez', 'H'],
    ['Renata', 'Cabrera', 'Delgado', 'M'],
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

  const acreditados: Acreditado[] = [];

  // 17 personas físicas
  nombresFisica.forEach(([nombre, apellidoPaterno, apellidoMaterno, sexo], i) => {
    const entidad = randomFrom(entidades, i);
    const esPep = i === 3 || i === 11; // un par marcados como PEP
    const fechaNacimiento = `19${60 + (i % 35)}-0${(i % 9) + 1}-1${i % 9}`;
    acreditados.push(
      acreditadosRepo.create({
        codigo: `CLI-${1000 + i}`,
        tipoPersona: TipoPersona.FISICA,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        rfc: fakeRfc(nombre, apellidoPaterno, i),
        curp: generarCurp({ nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, sexo, entidad }),
        fechaNacimiento,
        paisNacimiento: 'MEXICO',
        nacionalidad: 'Mexicana',
        zonaGeografica: randomFrom(zonasGeograficas, i),
        pais: 'México',
        localidad: localidadesPorEntidad[entidad],
        entidad,
        experienciaActividad: 1 + (i % 20),
        fechaInicioActividad: fechaInicioActividadDesdeAntiguedad(
          new Date().toISOString().slice(0, 10),
          1 + (i % 20),
        ),
        actividadEconomica: randomFrom(actividadesEconomicasFisica, i),
        domicilio: {
          calle: `Calle ${10 + i}`,
          numeroExterior: `${100 + i}`,
          colonia: 'Centro',
          codigoPostal: CODIGO_POSTAL_POR_ENTIDAD[entidad],
          municipio: localidadesPorEntidad[entidad],
          entidad,
          pais: 'México',
        },
        telefono: `55${String(10000000 + i * 137).slice(0, 8)}`,
        email: `${nombre.toLowerCase()}.${apellidoPaterno.toLowerCase()}@correo-prueba.com`,
        estatus: i % 9 === 0 ? EstatusAcreditado.INACTIVO : EstatusAcreditado.ACTIVO,
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
    acreditados.push(
      acreditadosRepo.create({
        codigo: `CLI-${1100 + i}`,
        tipoPersona: TipoPersona.MORAL,
        nombre: razonSocial,
        rfc: `${razonSocial.replace(/[^A-Z]/g, '').slice(0, 3)}${String(900000 + i).padStart(6, '0')}XX${i}`,
        nacionalidad: 'Mexicana',
        paisNacimiento: 'MEXICO',
        zonaGeografica: randomFrom(zonasGeograficas, idx),
        pais: 'México',
        localidad: localidadesPorEntidad[entidad],
        entidad,
        tiempoConstitucion: 1 + (i % 25),
        fechaInicioActividad: fechaInicioActividadDesdeAntiguedad(
          new Date().toISOString().slice(0, 10),
          1 + (i % 25),
        ),
        actividadEconomica: randomFrom(actividadesEconomicasMoral, idx),
        domicilio: {
          calle: 'Av. Industria',
          numeroExterior: `${200 + i}`,
          colonia: 'Parque Industrial',
          codigoPostal: CODIGO_POSTAL_POR_ENTIDAD[entidad],
          municipio: localidadesPorEntidad[entidad],
          entidad,
          pais: 'México',
        },
        telefono: `81${String(20000000 + i * 219).slice(0, 8)}`,
        email: `contacto@${razonSocial.split(' ')[0].toLowerCase()}.com.mx`,
        estatus: EstatusAcreditado.ACTIVO,
        nivelRiesgo: randomFrom(nivelesRiesgo, idx),
        esPep: false,
        tieneHistorial: i % 3 !== 0,
        origenRecursos: 'Ingresos por actividad empresarial',
        destinoRecursos: 'Capital de trabajo y reinversión',
      }),
    );
  });

  acreditados.forEach((acreditado, i) => completarParaEvaluacion(acreditado, i));
  acreditados.push(
    ...acreditadosIntegracion.map((demo) => acreditadosRepo.create(demo)),
  );
  const acreditadosGuardados = await acreditadosRepo.save(acreditados);
  console.log(`Acreditados creados: ${acreditadosGuardados.length}`);

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

  acreditadosGuardados.forEach((acreditado, i) => {
    if (acreditado.tipoPersona === TipoPersona.FISICA) {
      // A la mitad de las personas físicas les damos aval y/o cónyuge
      if (i % 2 === 0) {
        const [nombre, apellidoPaterno, apellidoMaterno] = randomFrom(nombresRelacionados, i);
        personas.push(
          personasRepo.create({
            acreditadoId: acreditado.id,
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
            acreditadoId: acreditado.id,
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
          acreditadoId: acreditado.id,
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
            acreditadoId: acreditado.id,
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
