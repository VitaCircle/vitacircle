# MongoDB collections (Phase 0 schema)

Indexes are declared on the Mongoose schemas under `apps/api/src/schemas`.

- `users` — unique `email`, unique `username`, `orgId`
- `sessions` — `userId`, TTL on `expiresAt`
- `portfolios` — `ownerId`, unique sparse `publishedSlug`, unique sparse `customDomain`
- `versions` — `portfolioId`
- `assets` — `ownerId`
- `aiReports` — `portfolioId`
- `exports` — `portfolioId`
- `analyticsEvents` — `portfolioId`
- `analyticsDaily` — unique `{ portfolioId, day }`
- `applications` — `ownerId`
- `subscriptions` — unique `userId`
- `auditLogs`
- `featureFlags` — unique `key`
- `notifications` — `userId`
- `organizations`, `orgInvites`
- `inquiries` — `portfolioId`
- `apiKeys` — `userId`
- `comments` — `portfolioId`
- `reports` (moderation)
- `stripeEvents` — unique `eventId`
- `customDomains` — unique `host`

All user-owned documents include nullable `orgId` where relevant so Education (Phase 4) does not require a rewrite.
