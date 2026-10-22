import React, { useState } from 'react';

const TIPOS_PERSONA = [
  ['FISICA', 'Persona física'],
  ['FISICA_ACTIVIDAD_EMPRESARIAL', 'Física con actividad empresarial'],
  ['MORAL', 'Persona moral'],
];
const ESTATUS = ['ACTIVO', 'INACTIVO'];
const NIVELES_RIESGO = ['BAJO', 'MEDIO', 'ALTO'];

// Ids de los catálogos de la Matriz PLD (ver socios-service/src/seeds/seed-data.ts).
const TIPOS_CREDITO = [
  [1, 'CREDINOMINA INTELIGENTE'],
  [2, 'FRANQUIFONDO'],
  [3, 'CREDIPLUS'],
];
const ORIGENES_RECURSOS = [1, 2, 3, 4, 5];
const DESTINOS_RECURSOS = [1, 2, 3, 4];
const CANALES_PAGO = [1, 2, 3];

const CAMPOS_TEXTO = [
  'nombre', 'apellidoPaterno', 'apellidoMaterno', 'rfc', 'curp', 'fechaNacimiento',
  'paisNacimiento', 'nacionalidad', 'zonaGeografica', 'pais', 'localidad', 'entidad',
  'actividadEconomica', 'fechaInicioActividad', 'origenRecursos', 'destinoRecursos',
  'telefono', 'email', 'fechaAlta', 'estatus', 'nivelRiesgo',
];
const CAMPOS_ENTEROS = ['tiempoConstitucion', 'experienciaActividad'];
const CAMPOS_DOMICILIO = [
  'calle', 'numeroExterior', 'numeroInterior', 'colonia', 'codigoPostal', 'municipio', 'entidad', 'pais',
];
const CAMPOS_CREDITO = ['referencia', 'tipoCreditoId', 'monto', 'origenRecursosId', 'destinoRecursosId', 'canalPagoId'];

/** Acreditado de la API → estado plano del formulario (todo como string, salvo los booleanos). */
function aFormulario(a = {}) {
  const f = { tipoPersona: a.tipoPersona ?? 'FISICA', tieneHistorial: !!a.tieneHistorial, esPep: !!a.esPep };
  for (const c of [...CAMPOS_TEXTO, ...CAMPOS_ENTEROS]) f[c] = a[c] ?? '';
  f.domicilio = { localidadId: a.domicilio?.localidadId ?? '' };
  for (const c of CAMPOS_DOMICILIO) f.domicilio[c] = a.domicilio?.[c] ?? '';
  f.credito = {};
  for (const c of CAMPOS_CREDITO) f.credito[c] = a.creditoSolicitado?.[c] ?? '';
  return f;
}

const texto = (v) => (String(v).trim() === '' ? null : String(v).trim());
const entero = (v) => (String(v).trim() === '' ? null : parseInt(v, 10));
const tieneDatos = (obj) => Object.values(obj).some((v) => String(v).trim() !== '');

/** Estado del formulario → cuerpo para la API. Los campos vacíos quedan en null. */
function aPayload(f) {
  const p = { tipoPersona: f.tipoPersona, tieneHistorial: f.tieneHistorial, esPep: f.esPep };
  for (const c of CAMPOS_TEXTO) p[c] = texto(f[c]);
  for (const c of CAMPOS_ENTEROS) p[c] = entero(f[c]);
  // Una persona moral no lleva apellidos ni CURP (la API rechaza la CURP en morales).
  if (f.tipoPersona === 'MORAL') p.apellidoPaterno = p.apellidoMaterno = p.curp = null;
  p.domicilio = { localidadId: entero(f.domicilio.localidadId) };
  for (const c of CAMPOS_DOMICILIO) p.domicilio[c] = texto(f.domicilio[c]);
  p.creditoSolicitado = tieneDatos(f.credito)
    ? {
        referencia: texto(f.credito.referencia),
        tipoCreditoId: entero(f.credito.tipoCreditoId),
        monto: f.credito.monto === '' ? null : Number(f.credito.monto),
        origenRecursosId: entero(f.credito.origenRecursosId),
        destinoRecursosId: entero(f.credito.destinoRecursosId),
        canalPagoId: entero(f.credito.canalPagoId),
      }
    : null;
  return p;
}

/** Alta: solo se manda lo que se capturó (sin fechaAlta la API usa la fecha del día). */
function payloadAlta(f) {
  const p = aPayload(f);
  const domicilio = Object.fromEntries(Object.entries(p.domicilio).filter(([, v]) => v !== null));
  p.domicilio = Object.keys(domicilio).length > 0 ? domicilio : null;
  return Object.fromEntries(Object.entries(p).filter(([, v]) => v !== null));
}

/** Edición: solo se manda lo que cambió; un campo que se vació viaja como null. */
function payloadEdicion(inicial, f) {
  const antes = aPayload(inicial);
  const despues = aPayload(f);
  delete despues.fechaAlta; // la fecha de alta solo se fija al crear
  return Object.fromEntries(
    Object.entries(despues).filter(([c, v]) => JSON.stringify(v) !== JSON.stringify(antes[c])),
  );
}

function mensajeDeError(data, porDefecto) {
  const m = data?.message;
  return Array.isArray(m) ? m.join('\n') : m || porDefecto;
}

function Campo({ etiqueta, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, gap: 2 }}>
      {etiqueta}
      {children}
    </label>
  );
}

const estiloInput = { padding: 6, fontSize: 14 };
const estiloGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 };

export default function FormularioAcreditado({ apiUrl, token, acreditado, onGuardado, onCancelar }) {
  const esEdicion = !!acreditado;
  const [inicial] = useState(() => aFormulario(acreditado));
  const [f, setF] = useState(inicial);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const moral = f.tipoPersona === 'MORAL';
  const creditoCapturado = tieneDatos(f.credito);

  const set = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setF((prev) => ({ ...prev, [campo]: valor }));
  };
  const setDomicilio = (campo) => (e) =>
    setF((prev) => ({ ...prev, domicilio: { ...prev.domicilio, [campo]: e.target.value } }));
  const setCredito = (campo) => (e) =>
    setF((prev) => ({ ...prev, credito: { ...prev.credito, [campo]: e.target.value } }));

  const input = (campo, etiqueta, props = {}) => (
    <Campo etiqueta={etiqueta}>
      <input value={f[campo]} onChange={set(campo)} style={estiloInput} {...props} />
    </Campo>
  );
  const select = (valor, onChange, opciones, props = {}) => (
    <select value={valor} onChange={onChange} style={estiloInput} {...props}>
      <option value="">—</option>
      {opciones.map((o) => {
        const [v, t] = Array.isArray(o) ? o : [o, o];
        return (
          <option key={v} value={v}>
            {t}
          </option>
        );
      })}
    </select>
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const body = esEdicion ? payloadEdicion(inicial, f) : payloadAlta(f);
    if (esEdicion && Object.keys(body).length === 0) {
      onCancelar();
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(esEdicion ? `${apiUrl}/acreditados/${acreditado.id}` : `${apiUrl}/acreditados`, {
        method: esEdicion ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(mensajeDeError(data, 'No se pudo guardar el acreditado'));
      await onGuardado(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ border: '1px solid #ccc', borderRadius: 4, padding: 16, marginTop: 16, background: '#fafafa' }}
    >
      <h2 style={{ marginTop: 0 }}>{esEdicion ? `Editar acreditado ${acreditado.id}` : 'Alta de acreditado'}</h2>

      <h3>Datos generales</h3>
      <div style={estiloGrid}>
        <Campo etiqueta="Tipo de persona *">
          <select value={f.tipoPersona} onChange={set('tipoPersona')} style={estiloInput} required>
            {TIPOS_PERSONA.map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
        </Campo>
        {input('nombre', moral ? 'Razón social *' : 'Nombre *', { required: true })}
        {!moral && input('apellidoPaterno', 'Apellido paterno')}
        {!moral && input('apellidoMaterno', 'Apellido materno')}
        {input('rfc', 'RFC')}
        {!moral && input('curp', 'CURP', { maxLength: 18 })}
        {input('fechaNacimiento', moral ? 'Fecha de constitución' : 'Fecha de nacimiento', { type: 'date' })}
        {input('paisNacimiento', 'País de nacimiento')}
        {input('nacionalidad', 'Nacionalidad')}
        {input('telefono', 'Teléfono')}
        {input('email', 'Email', { type: 'email' })}
        {esEdicion ? (
          <Campo etiqueta="Fecha de alta">
            <input value={f.fechaAlta} disabled style={estiloInput} />
          </Campo>
        ) : (
          input('fechaAlta', 'Fecha de alta (vacío = hoy)', { type: 'date' })
        )}
      </div>

      <h3>Ubicación y actividad</h3>
      <div style={estiloGrid}>
        {input('zonaGeografica', 'Zona geográfica')}
        {input('pais', 'País')}
        {input('entidad', 'Entidad')}
        {input('localidad', 'Localidad')}
        {input('actividadEconomica', 'Actividad económica (clave SAT)')}
        {input('fechaInicioActividad', 'Fecha de inicio de actividad', { type: 'date' })}
        {input('tiempoConstitucion', 'Tiempo de constitución (años)', { type: 'number', min: 0, step: 1 })}
        {input('experienciaActividad', 'Experiencia en su actividad (años)', { type: 'number', min: 0, step: 1 })}
        {input('origenRecursos', 'Origen de recursos')}
        {input('destinoRecursos', 'Destino de recursos')}
      </div>

      <h3>Domicilio</h3>
      <div style={estiloGrid}>
        <Campo etiqueta="Localidad ID">
          <input
            type="number"
            min={1}
            step={1}
            value={f.domicilio.localidadId}
            onChange={setDomicilio('localidadId')}
            style={estiloInput}
          />
        </Campo>
        {[
          ['calle', 'Calle'],
          ['numeroExterior', 'Número exterior'],
          ['numeroInterior', 'Número interior'],
          ['colonia', 'Colonia'],
          ['codigoPostal', 'Código postal'],
          ['municipio', 'Municipio'],
          ['entidad', 'Entidad'],
          ['pais', 'País'],
        ].map(([campo, etiqueta]) => (
          <Campo key={campo} etiqueta={etiqueta}>
            <input
              value={f.domicilio[campo]}
              onChange={setDomicilio(campo)}
              style={estiloInput}
              {...(campo === 'codigoPostal' ? { pattern: '\\d{5}', maxLength: 5 } : {})}
            />
          </Campo>
        ))}
      </div>

      <h3>Crédito solicitado</h3>
      <p style={{ fontSize: 12, marginTop: 0 }}>Opcional; si capturas algún dato, todos los campos son obligatorios.</p>
      <div style={estiloGrid}>
        <Campo etiqueta="Referencia">
          <input
            value={f.credito.referencia}
            onChange={setCredito('referencia')}
            style={estiloInput}
            required={creditoCapturado}
          />
        </Campo>
        <Campo etiqueta="Tipo de crédito">
          {select(f.credito.tipoCreditoId, setCredito('tipoCreditoId'), TIPOS_CREDITO, { required: creditoCapturado })}
        </Campo>
        <Campo etiqueta="Monto">
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={f.credito.monto}
            onChange={setCredito('monto')}
            style={estiloInput}
            required={creditoCapturado}
          />
        </Campo>
        <Campo etiqueta="Origen de recursos (ID)">
          {select(f.credito.origenRecursosId, setCredito('origenRecursosId'), ORIGENES_RECURSOS, {
            required: creditoCapturado,
          })}
        </Campo>
        <Campo etiqueta="Destino de recursos (ID)">
          {select(f.credito.destinoRecursosId, setCredito('destinoRecursosId'), DESTINOS_RECURSOS, {
            required: creditoCapturado,
          })}
        </Campo>
        <Campo etiqueta="Canal de pago (ID)">
          {select(f.credito.canalPagoId, setCredito('canalPagoId'), CANALES_PAGO, { required: creditoCapturado })}
        </Campo>
      </div>

      <h3>Perfil PLD</h3>
      <div style={estiloGrid}>
        <Campo etiqueta="Estatus">{select(f.estatus, set('estatus'), ESTATUS)}</Campo>
        <Campo etiqueta="Nivel de riesgo">{select(f.nivelRiesgo, set('nivelRiesgo'), NIVELES_RIESGO)}</Campo>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={f.esPep} onChange={set('esPep')} /> Es PEP
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={f.tieneHistorial} onChange={set('tieneHistorial')} /> Tiene historial
        </label>
      </div>

      {error && <p style={{ color: 'crimson', whiteSpace: 'pre-wrap' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="submit" disabled={guardando} style={{ padding: '6px 16px' }}>
          {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Dar de alta'}
        </button>
        <button type="button" onClick={onCancelar} disabled={guardando} style={{ padding: '6px 16px' }}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
