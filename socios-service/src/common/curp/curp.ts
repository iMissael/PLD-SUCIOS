/**
 * Validación de CURP según la estructura de RENAPO:
 *
 *   GOPM 850315 M DF RRR 0 7
 *   │    │      │ │  │   │ └ dígito verificador
 *   │    │      │ │  │   └── homoclave (dígito si nació antes de 2000, letra desde 2000)
 *   │    │      │ │  └────── consonantes internas (ap. paterno, ap. materno, nombre)
 *   │    │      │ └───────── entidad de nacimiento (NE = nacido en el extranjero)
 *   │    │      └─────────── sexo (H, M; X para personas no binarias)
 *   │    └────────────────── fecha de nacimiento AAMMDD
 *   └─────────────────────── iniciales
 */

// Iniciales · AAMMDD · sexo · entidad (AS…ZS, NE) · consonantes · homoclave · verificador
const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HMX](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\d$/;

const DICCIONARIO = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

/** Calcula el dígito verificador a partir de los primeros 17 caracteres. */
export function digitoVerificadorCurp(curp17: string): number {
  let suma = 0;
  for (let i = 0; i < 17; i++) {
    suma += DICCIONARIO.indexOf(curp17[i]) * (18 - i);
  }
  return (10 - (suma % 10)) % 10;
}

/**
 * Fecha de nacimiento (YYYY-MM-DD) codificada en la CURP. El siglo se deduce
 * de la homoclave: dígito → 1900s, letra → 2000s.
 */
export function fechaNacimientoDeCurp(curp: string): string {
  const siglo = /\d/.test(curp[16]) ? '19' : '20';
  return `${siglo}${curp.slice(4, 6)}-${curp.slice(6, 8)}-${curp.slice(8, 10)}`;
}

export function esCurpValida(valor: unknown): boolean {
  if (typeof valor !== 'string') return false;
  const curp = valor.toUpperCase();
  if (!CURP_REGEX.test(curp)) return false;

  // Descarta fechas imposibles como 31 de febrero
  const fecha = fechaNacimientoDeCurp(curp);
  const d = new Date(`${fecha}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== fecha) return false;

  return digitoVerificadorCurp(curp.slice(0, 17)) === Number(curp[17]);
}
