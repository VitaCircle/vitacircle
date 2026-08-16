# VitaCircle

The operating system for creative job seekers — a media-first portfolio you can tailor to a role, score with AI, share as a live site, and export as PDF/Word.

## Quick start (one command)

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and Node.js 20+. Then from the repo root:

```bash
./start.sh
```

Windows (PowerShell):

```powershell
.\start.ps1
```

Same thing via Make or npm:

```bash
make start
npm run env:start
```

That command copies `.env` from `.env.example` if needed, builds and starts every service, waits until they are healthy, runs idempotent seed/indexes, and prints URLs.

Open **http://localhost:3000** when the banner appears.

### Commands

| Command | What it does |
|---------|----------------|
| `./start.sh` / `.\start.ps1` / `make start` / `npm run env:start` | Build, start, wait, seed, print URLs |
| `make stop` / `npm run env:stop` | Stop containers (**volumes kept**) |
| `make restart` / `npm run env:restart` | Stop then start without wiping data |
| `make logs` / `npm run env:logs` | Follow container logs |
| `make migrate` / `npm run env:migrate` | Sync Mongo indexes |
| `make seed` / `npm run env:seed` | Idempotent admin + feature-flag seed |
| `make health` / `npm run env:health` | Check exposed URLs |
| `make rebuild` / `npm run env:rebuild` | Recreate containers from new images (data kept) |
| `make reset` / `npm run env:reset` | **Deletes volumes**, then starts clean |

`reset` is the only destructive command.

### URLs

| What | URL |
|------|-----|
| Application | http://localhost:3000 |
| API | http://localhost:4000 |
| API health | http://localhost:4000/health |
| AI | http://localhost:8000 |
| AI docs | http://localhost:8000/docs |
| Admin (in-app) | http://localhost:3000/app/admin |
| MinIO console | http://localhost:9001 (`vitacircle` / `vitacircle-dev`) |

Dev admin email/password come from `.env` (`BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD`).

## Local npm (optional, without full Docker apps)

Use this only if you are iterating on host Node/Python. The one-command path above is the supported setup.

1. `docker compose up -d mongo redis minio`
2. Copy `.env.example` to `.env` (keep `127.0.0.1` URIs for Mongo/Redis)
3. `npm install`
4. `npm run dev:api` and `npm run dev:web`

Without Python or an LLM key, the API uses a heuristic role-fit scorer.

## Monorepo

| Package | Stack | Port |
|---------|--------|------|
| `apps/web` | Next.js 15 (App Router) | 3000 |
| `apps/api` | NestJS + MongoDB | 4000 |
| `apps/ai` | Python FastAPI | 8000 |
| `packages/shared` | Zod block schema, plans, templates | — |
| `packages/design-tokens` | Figma-aligned tokens | — |

## GitHub organization

See [docs/github-org.md](docs/github-org.md). The remote is `github.com/VitaCircle/vitacircle`.

## License

MIT — see `LICENSE`.
