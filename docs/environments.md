# Environments

| Name | Web | API | Data | Purpose |
|------|-----|-----|------|---------|
| local | http://localhost:3000 | http://localhost:4000 | Docker Compose (Mongo, Redis, MinIO, API, web, AI) via `./start.sh` | Development |
| staging | staging.vitacircle.app | api.staging.vitacircle.app | Atlas staging + R2 | QA, preview |
| production | vitacircle.app | api.vitacircle.app | Atlas prod replica set, PITR | Live |

## Secrets

Never store secrets in git. Use:

- local: `.env` (gitignored; `./start.sh` copies `.env.example` if missing)
- staging/production: cloud secret manager (Vercel/Fly/AWS)

## Restore objectives

- RPO: 1 hour (Atlas PITR)
- RTO: 4 hours (documented restore drill quarterly)
