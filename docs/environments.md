# Environments

| Name | Web | API | Data | Purpose |
|------|-----|-----|------|---------|
| local | http://localhost:3000 | http://localhost:4000 | Docker Compose (Mongo, Redis, MinIO, MailHog, API, web, AI) via `./start.sh` | Development |
| staging | staging.vitacircle.app | api.staging.vitacircle.app | Atlas staging + R2 | QA, preview |
| production | vitacircle.app | api.vitacircle.app | Atlas prod replica set, PITR | Live |

## Secrets

Never store secrets in git. Use:

- local: `.env` (gitignored; `./start.sh` copies `.env.example` if missing)
- staging/production: cloud secret manager (Vercel/Fly/AWS)

## Local email

Local development uses MailHog for SMTP:

- SMTP: `127.0.0.1:1025` on the host, `mailhog:1025` inside Docker
- Inbox UI: http://localhost:8025
- From address: `VitaCircle <noreply@vitacircle.local>`

## Restore objectives

- RPO: 1 hour (Atlas PITR)
- RTO: 4 hours (documented restore drill quarterly)
