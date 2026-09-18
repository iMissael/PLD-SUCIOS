# socios-service

Microservicio de pruebas en NestJS, independiente del proyecto `denuncias-app` (Spring Boot).
No es multitenant: un solo esquema de base de datos.

## Dominio

- **usuarios**: quienes hacen consultas (rol `ADMIN`, `ANALISTA` o `CONSULTA`).
- **socios**: los clientes que se consultan (persona física o moral).
- **personas_relacionadas**: personas ligadas a un socio (`AVAL`, `CONYUGE`,
  `REPRESENTANTE_LEGAL`, `BENEFICIARIO_CONTROLADOR`, `REFERENCIA`).

## Puertos (elegidos para NO chocar con denuncias-app)

| Servicio | Puerto |
|---|---|
| App NestJS | `3001` |
| Postgres (host) | `5544` (dentro del contenedor sigue siendo 5432) |

`denuncias-app` ya ocupa `5432`/`8080`, por eso aquí se usan `5433`/`3001`.

## Requisitos

- Node 20+
- pnpm
- Docker (para levantar Postgres)

## Puesta en marcha

```bash
cp .env.example .env
pnpm install

# Levanta Postgres en el puerto 5433
docker compose up -d

# Ejecuta la migración manual (crea las 3 tablas + enums)
pnpm run migration:run

# (opcional) crea SOLO un usuario ADMIN de prueba: admin@socios-service.local / Admin123!
pnpm run seed:admin

# (opcional, recomendado) crea 5 usuarios, 25 socios variados y sus
# personas relacionadas (aval/cónyuge/representante legal/beneficiario).
# No duplica datos si ya existen socios en la base.
pnpm run seed:data

# Arranca el servicio
pnpm run start:dev
```

El servicio queda en `http://localhost:3001`.

## Autenticación

```
POST /auth/login
{ "email": "admin@socios-service.local", "password": "Admin123!" }
```

Responde un `accessToken` (JWT). Todos los endpoints de `socios` y
`personas-relacionadas` requieren `Authorization: Bearer <token>`.
Los de `usuarios` además requieren rol `ADMIN`.

## Endpoints principales

- `POST /auth/login`
- `POST /usuarios` · `GET /usuarios` · `GET /usuarios/:id` · `PATCH /usuarios/:id` · `DELETE /usuarios/:id` (solo ADMIN)
- `POST /socios` · `GET /socios` · `GET /socios/:id` · `PATCH /socios/:id` · `DELETE /socios/:id`
- `POST /personas-relacionadas` · `GET /personas-relacionadas?socioId=<uuid>` · `GET /personas-relacionadas/:id` · `PATCH /personas-relacionadas/:id` · `DELETE /personas-relacionadas/:id`

## Migraciones

Siguiendo la misma convención que en `denuncias-app`: migraciones manuales
(nunca `synchronize: true`, nunca `migration:generate` a ciegas), con
guardas `IF NOT EXISTS` para poder re-ejecutarlas sin romper nada.

```bash
pnpm run migration:run      # aplica migraciones pendientes
pnpm run migration:revert   # revierte la última
```

## Próximos pasos posibles (fuera del alcance de esta primera versión)

- Módulo de `listas` (OFAC, PEP, listas internas) y `consultas` para el
  historial de auditoría de búsquedas — se dejó fuera a propósito por ahora.
- Fuzzy matching con `pg_trgm` sobre `socios`/`personas_relacionadas`.
