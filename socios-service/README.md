# acreditados-service

Microservicio de prueba en NestJS para acreditados, usuarios y personas relacionadas.
La base local conserva el nombre `socios_db` para reutilizar el volumen existente;
la migración cambia la tabla `socios` a `acreditados` sin borrar registros.

## Dominio

- **usuarios**: los empleados que hacen consultas (rol `ADMIN`, `ANALISTA` o
  `CONSULTA`). Llevan CURP y domicilio.
- **acreditados**: clientes que se consultan (persona física o moral).
- **personas_relacionadas**: personas ligadas a un acreditado (`AVAL`, `CONYUGE`,
  `REPRESENTANTE_LEGAL`, `BENEFICIARIO_CONTROLADOR`, `REFERENCIA`).

## Puertos (elegidos para NO chocar con denuncias-app)

| Servicio | Puerto |
|---|---|
| App NestJS | `3001` |
| Postgres (host) | `5544` (dentro del contenedor sigue siendo 5432) |

`denuncias-app` ya ocupa `5432`/`8080`, por eso aquí se usan `5544`/`3001`.

## Requisitos

- Node 20+
- pnpm
- Docker (para levantar Postgres)

## Puesta en marcha

```bash
cp .env.example .env
pnpm install

# Levanta Postgres en el puerto 5544
docker compose up -d

# (opcional) crea SOLO un usuario ADMIN de prueba: admin@acreditados-service.local / Admin123!
pnpm run seed:admin

# (opcional, recomendado) crea 5 usuarios, acreditados de prueba y sus
# personas relacionadas (aval/cónyuge/representante legal/beneficiario).
# También asegura los registros de integración CLI-900, CLI-901 y CLI-902.
pnpm run seed:data

# Arranca el servicio
pnpm run start:dev
```

El servicio queda en `http://localhost:3001`.

## Autenticación

```
POST /auth/login
{ "email": "admin@acreditados-service.local", "password": "Admin123!" }
```

Responde un `accessToken` (JWT). `GET /acreditados` y `GET /acreditados/:id`
son públicos para la integración; las operaciones de escritura de acreditados
y las rutas de `personas-relacionadas` requieren `Authorization: Bearer <token>`.
Las rutas de `usuarios` además requieren rol `ADMIN`.
`admin@acreditados-service.local` es un alias del administrador de prueba
existente y acepta `Admin123!`; no crea un usuario adicional.

## Endpoints principales

- `POST /auth/login`
- `POST /usuarios` · `GET /usuarios` · `GET /usuarios/:id` · `PATCH /usuarios/:id` · `DELETE /usuarios/:id` (solo ADMIN)
- `GET /acreditados` · `GET /acreditados/:id` (sin filtros; admite códigos públicos como `CLI-900`)
- `POST /acreditados` · `PATCH /acreditados/:id` · `DELETE /acreditados/:id` (requieren token)
- `POST /personas-relacionadas` · `GET /personas-relacionadas?acreditadoId=<uuid-o-codigo>` · `GET /personas-relacionadas/:id` · `PATCH /personas-relacionadas/:id` · `DELETE /personas-relacionadas/:id`

## Domicilio y CURP

Los acreditados y usuarios comparten el mismo domicilio desglosado
(`src/common/domicilio`), que en el JSON va anidado:

```json
"domicilio": {
  "calle": "Insurgentes Sur", "numeroExterior": "1605", "numeroInterior": "301",
  "colonia": "San José Insurgentes", "codigoPostal": "03900",
  "municipio": "Benito Juárez", "entidad": "Ciudad de México", "pais": "México"
}
```

En la base son columnas `domicilio_calle`, `domicilio_numero_exterior`, etc.
Todos los campos son opcionales; `codigoPostal` debe tener 5 dígitos.

Los acreditados pueden incluir `paisNacimiento` y `fechaInicioActividad`
(formato `AAAA-MM-DD`).
El domicilio acepta `localidadId` entre `1` y `38017`. `actividadEconomica`
acepta claves SAT numéricas entre `100008` y `9999999`; se conservan también
las etiquetas textuales de los registros de prueba existentes. `creditoSolicitado`
e `historialCrediticio` son opcionales y se guardan como JSONB.

```json
{
  "domicilio": { "calle": "CALLE 22" },
  "actividadEconomica": "8400004",
  "creditoSolicitado": {
    "referencia": "CRED-0001",
    "tipoCreditoId": 2,
    "monto": 150000,
    "origenRecursosId": 2,
    "destinoRecursosId": 2,
    "canalPagoId": 1
  },
  "historialCrediticio": [
    {
      "referencia": "CRED-0000",
      "tipoCreditoId": 1,
      "monto": 20000,
      "fechaOtorgamiento": "2023-02-10",
      "estatus": "PAGADO"
    }
  ]
}
```

El domicilio solo valida el rango numérico del identificador; no se agregó un
catálogo de localidades. `localidadId: 201945` no es válido bajo el rango
`1`–`38017`.

La CURP (acreditados, personas relacionadas y usuarios) se valida con `@IsCurp()`
(`src/common/curp`): se pasa a mayúsculas y se revisan estructura, fecha real,
clave de entidad y dígito verificador. En acreditados además se exige que la fecha
de la CURP coincida con `fechaNacimiento` y que una persona moral no tenga CURP.

## Migraciones

Siguiendo la misma convención que en `denuncias-app`: migraciones manuales
(nunca `synchronize: true`, nunca `migration:generate` a ciegas), con
guardas `IF NOT EXISTS` para poder re-ejecutarlas sin romper nada.

Las pendientes se aplican solas al arrancar el servicio (`migrationsRun: true`).
La migración de renombrado conserva los UUID, datos y relaciones existentes, y
asigna códigos públicos a los acreditados que ya estaban guardados.
Las nuevas columnas `pais_nacimiento` y `fecha_inicio_actividad` son opcionales
y se agregan mediante una migración compatible con los datos existentes.
Cada migración nueva se registra en `src/migrations/index.ts`.

```bash
pnpm run migration:run      # aplica migraciones pendientes sin levantar el servicio
pnpm run migration:revert   # revierte la última
```

## Próximos pasos posibles (fuera del alcance de esta primera versión)

- Módulo de `listas` (OFAC, PEP, listas internas) y `consultas` para el
  historial de auditoría de búsquedas — se dejó fuera a propósito por ahora.
- Fuzzy matching con `pg_trgm` sobre `acreditados`/`personas_relacionadas`.
