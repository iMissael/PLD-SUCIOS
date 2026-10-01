import React, { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const CAMPOS_SOCIO = [
  ['tipoPersona', 'Tipo de persona'],
  ['rfc', 'RFC'],
  ['curp', 'CURP'],
  ['fechaNacimiento', 'Fecha de nacimiento'],
  ['nacionalidad', 'Nacionalidad'],
  ['zonaGeografica', 'Zona geográfica'],
  ['pais', 'País'],
  ['localidad', 'Localidad'],
  ['entidad', 'Entidad'],
  ['tiempoConstitucion', 'Tiempo de constitución (años)'],
  ['experienciaActividad', 'Experiencia en su actividad (años)'],
  ['actividadEconomica', 'Actividad económica'],
  ['domicilio', 'Domicilio', formatearDomicilio],
  ['telefono', 'Teléfono'],
  ['email', 'Email'],
  ['fechaAlta', 'Fecha de alta'],
  ['estatus', 'Estatus'],
  ['nivelRiesgo', 'Nivel de riesgo'],
  ['tieneHistorial', 'Tiene historial'],
  ['origenRecursos', 'Origen de recursos'],
  ['destinoRecursos', 'Destino de recursos'],
];

function formatearDomicilio(d) {
  if (!d) return null;
  const numero = [d.numeroExterior, d.numeroInterior && `Int. ${d.numeroInterior}`].filter(Boolean).join(' ');
  const partes = [
    [d.calle, numero].filter(Boolean).join(' '),
    d.colonia && `Col. ${d.colonia}`,
    d.codigoPostal && `C.P. ${d.codigoPostal}`,
    d.municipio,
    d.entidad,
    d.pais,
  ].filter(Boolean);
  return partes.join(', ');
}

function valorMostrable(valor) {
  if (valor === null || valor === undefined || valor === '') return '—';
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
  return valor;
}

export default function Home() {
  const [email, setEmail] = useState('admin@socios-service.local');
  const [password, setPassword] = useState('Admin123!');
  const [token, setToken] = useState(null);
  const [socios, setSocios] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandidoId, setExpandidoId] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Credenciales inválidas');
      const data = await res.json();
      setToken(data.accessToken);
      await cargarSocios(data.accessToken);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  async function cargarSocios(accessToken) {
    const res = await fetch(`${API_URL}/socios`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('No se pudieron cargar los socios');
    const data = await res.json();
    setSocios(data);
  }

  function handleLogout() {
    setToken(null);
    setSocios([]);
    setExpandidoId(null);
  }

  function toggleDetalle(id) {
    setExpandidoId((actual) => (actual === id ? null : id));
  }

  return (
    <main style={{ fontFamily: 'sans-serif', padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <h1>socios-service — visor de socios</h1>

      {!token ? (
        <form onSubmit={handleLogin} style={{ display: 'flex', gap: 8, alignItems: 'end', marginTop: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12 }}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 6 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: 6 }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '6px 16px' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      ) : (
        <div style={{ margin: '16px 0' }}>
          <button onClick={handleLogout} style={{ padding: '6px 16px' }}>
            Cerrar sesión
          </button>
        </div>
      )}

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {token && (
        <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', marginTop: 16, width: '100%' }}>
          <thead>
            <tr>
              <th>Nombre / Razón social</th>
              <th>Tipo</th>
              <th>RFC</th>
              <th>Entidad</th>
              <th>Actividad económica</th>
              <th>Nivel de riesgo</th>
              <th>PEP</th>
              <th>Estatus</th>
              <th>Relacionados</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {socios.map((s) => (
              <React.Fragment key={s.id}>
                <tr>
                  <td>
                    {s.nombre} {s.apellidoPaterno || ''} {s.apellidoMaterno || ''}
                  </td>
                  <td>{s.tipoPersona}</td>
                  <td>{s.rfc}</td>
                  <td>{s.entidad}</td>
                  <td>{s.actividadEconomica}</td>
                  <td>{s.nivelRiesgo}</td>
                  <td>{s.esPep ? 'Sí' : 'No'}</td>
                  <td>{s.estatus}</td>
                  <td>{s.personasRelacionadas?.length ?? 0}</td>
                  <td>
                    <button onClick={() => toggleDetalle(s.id)} style={{ padding: '2px 10px' }}>
                      {expandidoId === s.id ? 'Ocultar' : 'Ver detalle'}
                    </button>
                  </td>
                </tr>

                {expandidoId === s.id && (
                  <tr>
                    <td colSpan={10} style={{ background: '#fafafa' }}>
                      <div style={{ display: 'flex', gap: 32, padding: 12, flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 320 }}>
                          <h3 style={{ marginTop: 0 }}>Datos completos del socio</h3>
                          <table cellPadding="4">
                            <tbody>
                              {CAMPOS_SOCIO.map(([campo, etiqueta, formatear]) => (
                                <tr key={campo}>
                                  <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>{etiqueta}</td>
                                  <td>{valorMostrable(formatear ? formatear(s[campo]) : s[campo])}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div style={{ minWidth: 320, flex: 1 }}>
                          <h3 style={{ marginTop: 0 }}>Personas relacionadas</h3>
                          {(!s.personasRelacionadas || s.personasRelacionadas.length === 0) && (
                            <p>No tiene personas relacionadas registradas.</p>
                          )}
                          {s.personasRelacionadas && s.personasRelacionadas.length > 0 && (
                            <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
                              <thead>
                                <tr>
                                  <th>Relación</th>
                                  <th>Nombre</th>
                                  <th>RFC</th>
                                  <th>CURP</th>
                                  <th>Parentesco</th>
                                  <th>Teléfono</th>
                                  <th>Email</th>
                                </tr>
                              </thead>
                              <tbody>
                                {s.personasRelacionadas.map((p) => (
                                  <tr key={p.id}>
                                    <td>{p.tipoRelacion}</td>
                                    <td>
                                      {p.nombre} {p.apellidoPaterno || ''} {p.apellidoMaterno || ''}
                                    </td>
                                    <td>{valorMostrable(p.rfc)}</td>
                                    <td>{valorMostrable(p.curp)}</td>
                                    <td>{valorMostrable(p.parentesco)}</td>
                                    <td>{valorMostrable(p.telefono)}</td>
                                    <td>{valorMostrable(p.email)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
