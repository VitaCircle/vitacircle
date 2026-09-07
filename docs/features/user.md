# VitaCircle User Journey, Dashboard, Content, and Landing Redesign Plan

## Summary
- Build a guided logged-in dashboard for the user journey: log in, create resume/portfolio, add content, score with AI, publish, export, and track applications.
- Treat resume creation as the same content system as portfolios: one set of blocks powers the live portfolio, PDF resume, and Word export.
- Redesign the landing hero and authentication entry points to feel more modern, attractive, and smart, while keeping the local-first MVP stack.
- Add content patterns that guide users with prompts, readiness checks, and template starter copy.

## Key Changes
- **Dashboard:** Replace the simple portfolio list with a control center showing workflow cards for `Create resume`, `Build portfolio`, `Upload media`, `AI score`, `Publish`, `Export`, and `Track applications`.
- **Resume/Portfolio Flow:** Keep one content model using existing `DraftTree` portfolio blocks; add UI language that frames exports as “Resume PDF” and “Word resume” without adding a separate resume schema.
- **Publishing:** Surface publish readiness in the dashboard: email verified, required content present, media alt text complete, target role set, and public URL available after publish.
- **Content Pattern:** Add guided placeholders and checklist prompts for hero, about, projects, skills, experience, education, testimonials, awards, and contact sections.
- **Landing/Auth UI:** Modernize the landing hero with stronger headline hierarchy, cleaner CTAs, richer portfolio preview, better mobile layout, and a consistent visual language across login/register/onboarding.

## Interfaces / Types
- Reuse existing APIs where possible:
  - `GET /portfolios`
  - `POST /portfolios`
  - `PATCH /portfolios/:id`
  - `POST /portfolios/:id/publish`
  - `POST /exports`
  - `POST /ai/score`
  - `GET /assets`
  - `POST /assets/upload`
  - `GET /applications`
- Add a lightweight dashboard summary endpoint only if the UI becomes too chatty:
  - `GET /users/me/dashboard`
  - Returns portfolio counts, latest portfolio, publish status, latest AI score, application counts, media count, and next recommended action.
- Extend shared template/content metadata with non-breaking helper data:
  - section labels
  - guided prompt text
  - readiness requirements
  - dashboard action labels

## Implementation Plan
- Update the dashboard page at `apps/web/src/app/app/page.tsx` into a modern guided workspace:
  - top welcome area with user name, target role, and primary action
  - progress checklist for resume/portfolio readiness
  - cards for create, edit, publish, export, AI score, media, and applications
  - portfolio cards showing status, last updated date, target role, and quick actions
- Improve `AppShell`:
  - modern sidebar/nav styling
  - responsive mobile header
  - clear active sections for Dashboard, Portfolios, Media, Applications, Settings
- Improve builder UX:
  - rename user-facing export actions to resume-friendly labels
  - add content prompt copy beside editable fields
  - keep publish/export/AI actions visible and understandable
- Update landing/auth UI:
  - sharpen hero copy around “build, score, publish, export”
  - make hero portfolio preview feel like the actual app workflow
  - keep CTAs focused on `Create your resume` and `View talent`
  - keep login/register modern, simple, and visually aligned with the landing page
- Update shared templates:
  - enrich the advanced template with resume-ready project, experience, skills, and contact starter content
  - expose content prompts so dashboard/builder can guide users consistently

## Test Plan
- Run targeted type checks:
  - `npm run typecheck --workspace apps/web`
  - `npm run typecheck --workspace apps/api`
  - `npm run typecheck --workspace packages/shared`
- Manually verify:
  - login redirects to the dashboard
  - onboarding incomplete users still go to onboarding
  - create resume/portfolio opens the builder
  - publish action still uses the existing publish API
  - PDF and Word exports still show `Portfolio exported successfully.`
  - upload still shows `File uploaded successfully.`
  - landing, login, register, dashboard, and builder are responsive on mobile and desktop

## Assumptions
- “Create resume” means resume output from the same portfolio content, not a separate resume editor.
- Dashboard should prioritize a guided workflow for new and returning users.
- Content pattern should use smart guided prompts, not an empty blank canvas.
- MVP remains local-first for now: local MongoDB, local storage, local SMTP, heuristic AI fallback, and GitHub-managed source control.
