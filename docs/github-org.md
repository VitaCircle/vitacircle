# GitHub organization (SRS requirement)

Create the **VitaCircle** GitHub Organization (already used by `github.com/VitaCircle/vitacircle`).

## Required setup

1. Protect `main`: required PR reviews, required CI status, no force push.
2. Environments: `staging`, `production` with required reviewers for production secrets.
3. Branch: `staging` auto-deploys API + web preview; `main` deploys production.
4. CODEOWNERS for `apps/api`, `apps/ai`, `apps/web`.
5. Weekly AI cost review after Phase 1 (issue template in `.github`).
6. Keep development local-first: no production SMTP, storage, database, or LLM credentials should be required to run the MVP locally.
