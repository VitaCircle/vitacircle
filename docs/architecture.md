# Architecture

```
web (Next.js) → api (NestJS) → MongoDB
                              → Redis (optional; inline jobs if unset)
                              → local disk / S3
                              → Stripe
                              → email (console in dev)
                              → Python AI (FastAPI) → LLM
```

Public portfolio pages read `publishedSnapshot` only. Drafts never leave the owner/collaborator API.

Entitlements are enforced in NestJS (`EntitlementsService`), not only in the UI.
