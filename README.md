# PLD-SOCIOS

Proyecto de pruebas, independiente del sistema PLD principal (Spring Boot).
Dos partes:

- **`socios-service`** — backend en NestJS (API REST + auth JWT + PostgreSQL)
- **`socios-front`** — frontend mínimo en Next.js para visualizar los socios

No es multitenant: un solo esquema de base de datos, pensado solo para pruebas.

## Requisitos

- Node 20+
- pnpm (`npm install -g pnpm` si no lo tienes)
- Docker (para levantar Postgres)

## Puertos usados

| Servicio | Puerto |
|---|---|
| `socios-service` (API NestJS) | `3001` |
| Postgres de `socios-service` | `5544` |
| `socios-front` (Next.js) | `4300` |

Elegidos así para no chocar con el proyecto Spring Boot (`8080`/`5432`).

## 1. Clonar el repositorio

```bash
git clone https://github.com/iMissael/PLD-SOCIOS.git
cd PLD-SOCIOS
```

## 2. Levantar el backend (`socios-service`)

```bash
cd socios-service
cp .env.example .env
pnpm install

# Levanta Postgres en el puerto 5544
docker compose up -d

# Crea las tablas (usuarios, socios, personas_relacionadas)
pnpm run migration:run

# Siembra datos de prueba: 5 usuarios, 25 socios variados y sus
# personas relacionadas (aval/cónyuge/representante legal/beneficiario)
pnpm run seed:data

# Arranca la API
pnpm run start:dev
```

La API queda en `http://localhost:3001`.

### Verificar que funciona

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@socios-service.local","password":"Admin123!"}'
```

Debe regresar un `accessToken`.

## 3. Levantar el frontend (`socios-front`)

En otra terminal (deja el backend corriendo):

```bash
cd socios-front
cp env-local.example.txt .env.local
pnpm install
pnpm run dev
```

Abre `http://localhost:4300`, inicia sesión con:

```
email: admin@socios-service.local
password: Admin123!
```

Verás la tabla con los 25 socios. Cada fila tiene un botón **"Ver detalle"**
que despliega todos los campos del socio y sus personas relacionadas.

## Usuarios de prueba (creados por `seed:data`)

| Email | Password | Rol |
|---|---|---|
| admin@socios-service.local | Admin123! | ADMIN |
| ana.torres@socios-service.local | Analista123! | ANALISTA |
| luis.fernandez@socios-service.local | Analista123! | ANALISTA |
| karla.mendoza@socios-service.local | Consulta123! | CONSULTA |
| jorge.ramirez@socios-service.local | Consulta123! | CONSULTA |

Solo `ADMIN` puede administrar usuarios (`/usuarios`); todos los roles
autenticados pueden ver/crear/editar socios y personas relacionadas.

## Estructura del dominio

- **usuarios**: quienes consultan (rol `ADMIN`, `ANALISTA` o `CONSULTA`).
- **socios**: los clientes consultados (persona física o moral), con datos
  PLD como zona geográfica, nivel de riesgo, PEP, actividad económica,
  origen/destino de recursos, etc.
- **personas_relacionadas**: personas ligadas a un socio (`AVAL`, `CONYUGE`,
  `REPRESENTANTE_LEGAL`, `BENEFICIARIO_CONTROLADOR`, `REFERENCIA`).

Más detalle técnico de cada parte en `socios-service/README.md` y
`socios-front/README.md`.

## Notas

- Las credenciales de Postgres (`docker-compose.yml`) y el `JWT_SECRET` de
  ejemplo son solo valores de desarrollo local — cámbialos si esto llegara
  a usarse fuera de pruebas.
- `pnpm run seed:data` es seguro de re-ejecutar: si ya hay socios en la
  base, no duplica nada.
