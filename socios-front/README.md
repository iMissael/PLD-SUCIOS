# socios-front

Front mínimo en Next.js para visualizar los socios de `socios-service`.
Una sola página: login + tabla. Sin librerías extra, sin estilos elaborados.

## Puerto

`4300` — distinto del backend (`3001`), su Postgres (`5544`) y del proyecto
Spring Boot (`8080`/`5432`).

## Puesta en marcha

```bash
cp .env.local.example .env.local
pnpm install
pnpm run dev
```

Abre `http://localhost:4300`. Asegúrate de que `socios-service` esté
corriendo en `http://localhost:3001` (o ajusta `NEXT_PUBLIC_API_URL` en
`.env.local` si lo tienes en otro puerto).

Usa las credenciales que ya sembraste en el backend, por ejemplo:
`admin@socios-service.local` / `Admin123!`.
