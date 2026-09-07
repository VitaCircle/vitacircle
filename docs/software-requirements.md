# VitaCircle Software Requirements Specification

## 1. Project Overview

**Project name:** VitaCircle

**Product summary:** VitaCircle is a portfolio and resume platform for creative job seekers. It helps users build media-rich portfolios, tailor their work to career opportunities, receive AI role-fit feedback, publish a live portfolio, and export their portfolio as PDF or Microsoft Word.

**Target audience:**

- Students building their first career portfolio.
- New graduates preparing for internships, entry-level work, or freelance opportunities.
- Job seekers and economically active individuals improving their career presentation.
- Creative arts professionals, including UX/UI designers, graphic designers, photographers, illustrators, musicians, filmmakers, writers, fashion creatives, and architecture/interior design candidates.

**Problem:** Many job seekers struggle to create portfolios and resumes that are well structured, visually appealing, informative, and tailored to specific roles.

**Solution:** VitaCircle simplifies portfolio design and formatting with intuitive layout blocks and drag-and-drop editing. It also includes an AI assistant that evaluates a user portfolio against a desired role and provides a likelihood-style role-fit score with improvement suggestions.

## 2. MVP Scope

### In Scope

- User registration and secure login by email or username and password.
- Secure password hashing; passwords must never be stored in plain text.
- Core portfolio formatting with standard layout structures and reusable blocks.
- Media upload and embedding for approved file types, including `.png`, `.jpeg`, `.jpg`, and `.mp3`.
- Portfolio export to downloadable PDF and Microsoft Word `.docx` files.
- AI review that scores portfolio readiness for a selected target role.
- Responsive web interface for desktop and mobile browsers.
- GitHub Organization setup for repository ownership, access control, and deployment workflows.

### Out of Scope

- Advanced layout customization beyond core templates.
- Decorative design elements such as flower patterns, ornate borders, and complex themes.
- Real-time collaborative editing.
- Full recruiter marketplace workflows beyond basic public portfolio viewing.

## 3. Functional Requirements

### Authentication

- Users must be able to register with email, username, and password.
- Users must be able to log in securely using their credentials.
- The backend must validate credentials and issue authenticated sessions or access tokens only after successful login.
- The system must hash all passwords before storage.
- If a user enters an incorrect password, the system must deny access and display: **"Invalid credentials. Please try again."**
- The authentication flow must support protected app routes and keep public portfolio pages available without login.

### Portfolio Formatting

- Users must be able to create and edit a portfolio from standard sections.
- The MVP portfolio must support common creative-career blocks such as hero, about, experience, education, skills, projects, gallery, audio, video, awards, testimonials, contact, and embeds where enabled.
- Users must be able to arrange portfolio content into a readable layout that works on desktop and mobile.
- Users must be able to save portfolio draft updates before publishing or exporting.

### Media Uploads

- Users must be able to upload approved media files for use in portfolios.
- The system must validate file format and file size before accepting the upload.
- The system must store uploaded files in the configured storage provider.
- The system must update the database record after a successful upload.
- After a successful upload, the system must display: **"File uploaded successfully."**
- Unsupported files, oversized files, quota violations, and failed security scans must be rejected with a clear error.

### AI Portfolio Review

- Users must be able to request an AI role-fit score for a portfolio.
- The AI service must evaluate relevance, evidence, craft, completeness, and clarity.
- The system must return a score, critique, and actionable suggestions.
- If the Python AI service or LLM provider is unavailable, the platform may use the existing heuristic scorer as a fallback.
- AI usage must respect plan entitlements and user consent settings.

### Export Functionality

- Users must be able to export a portfolio as PDF or Microsoft Word `.docx`.
- The system must process portfolio data into the requested format.
- The system must save the generated export file in storage and provide a download path.
- The web app must trigger the download to the user's device.
- After a successful export, the system must display: **"Portfolio exported successfully."**

## 4. Non-Functional Requirements

### Performance

- Public pages and core app screens should load within 2 seconds under normal network and server conditions.
- Heavy operations such as AI scoring, media upload, and export generation should provide clear loading or progress states.

### Security

- Passwords must be hashed and never stored in plain text.
- Authenticated API routes must validate the current user before reading or changing user-owned data.
- Uploads must validate MIME type, size, storage quota, and scan status where malware scanning is enabled.
- Secrets must not be committed to git; local secrets belong in `.env`, and staging/production secrets belong in the cloud secret manager.

### Usability

- The interface must be intuitive for non-technical job seekers.
- Builder workflows must be responsive and usable on both desktop and mobile browsers.
- Status and error messages must be clear, short, and action-oriented.
- Core portfolio content must remain readable after export to PDF or Word.

## 5. Technical Architecture

VitaCircle uses the existing monorepo stack:

- **Frontend:** Next.js web app in `apps/web`.
- **Backend:** NestJS API in `apps/api`.
- **AI service:** Python FastAPI service in `apps/ai`.
- **Database:** MongoDB with Mongoose schemas.
- **Storage:** Local disk in development, S3-compatible storage for hosted environments.
- **Version control and deployment source:** GitHub, under the VitaCircle organization.
- **Cloud hosting:** Staging and production cloud environments for web, API, AI, MongoDB, and storage.

Supporting references:

- Architecture: [architecture.md](architecture.md)
- MongoDB schema: [mongo-schema.md](mongo-schema.md)
- Environments: [environments.md](environments.md)
- GitHub Organization setup: [github-org.md](github-org.md)

## 6. Database Overview

MongoDB is the primary database for VitaCircle. Core collections include:

- `users` for accounts, credentials, roles, settings, plan data, and usage counters.
- `sessions` for refresh/session lifecycle.
- `portfolios` for draft portfolio data, published snapshots, ownership, status, and slugs.
- `assets` for uploaded media metadata and storage keys.
- `aiReports` for AI role-fit scores, rubric results, critiques, and suggestions.
- `exports` for generated PDF, Word, and ATS export jobs.
- `analyticsEvents` and `analyticsDaily` for public portfolio analytics.
- `organizations` and `orgInvites` for future education/team support.

The detailed schema plan is maintained in [mongo-schema.md](mongo-schema.md).

## 7. Build Plan by Feature Segment

### 1. Authentication

- Implement and verify email/username registration.
- Implement secure login with hashed password validation.
- Return the required invalid-credential message on failed login.
- Protect authenticated dashboard, builder, media, export, AI, settings, and admin routes.
- Keep public pages and published portfolio pages accessible without login.
- Confirm refresh/logout flows work across browser sessions.

### 2. User Profile and Onboarding

- Capture the user's name, username, target role, and creative discipline.
- Store onboarding data on the user profile.
- Use the target role as the default context for AI scoring.
- Allow users to update basic account and privacy settings.

### 3. Portfolio Creation and Formatting

- Let users create a portfolio from a starter template.
- Support core portfolio blocks for creative arts use cases.
- Save draft changes to MongoDB.
- Keep draft content separate from published snapshots.
- Ensure portfolio layouts are responsive and export-friendly.

### 4. Drag-and-Drop Portfolio Builder

- Provide a builder view where users can add, edit, reorder, and remove content blocks.
- Render a live preview of the portfolio.
- Maintain stable block schemas through the shared package.
- Preserve user content when switching between supported layouts or templates.

### 5. Media Uploads

- Validate file MIME type and file size before upload completion.
- Accept MVP media types including PNG, JPEG/JPG, and MP3.
- Store files through the storage service.
- Create or update the asset database record.
- Display the required success message after upload.
- Reject unsupported or unsafe uploads with clear errors.

### 6. AI Portfolio Review and Role-Fit Score

- Send portfolio draft data and target role to the AI service.
- Score portfolios using the shared rubric: relevance, evidence, craft, completeness, and clarity.
- Return score, critique, and suggestions to the user.
- Store AI reports for later review.
- Use heuristic scoring when the Python AI service or LLM provider is unavailable.

### 7. Export to PDF and Word

- Generate PDF exports from portfolio data.
- Generate Microsoft Word `.docx` exports from portfolio data.
- Store export jobs and generated files.
- Provide a secure authenticated download path.
- Display the required export success message after successful generation.

### 8. Public Portfolio Publishing

- Let users publish a portfolio snapshot.
- Serve public portfolio pages from published snapshots only.
- Keep draft edits private until the user republishes.
- Support shareable username and slug URLs.

### 9. Dashboard and Portfolio Management

- Provide a dashboard listing user portfolios.
- Allow users to create, edit, publish, unpublish, archive, and export portfolios.
- Provide access to the media library, settings, billing, applications, and analytics where enabled.
- Keep dashboard pages usable on desktop and mobile.

### 10. Admin, QA, and Deployment

- Provide admin visibility for users, usage, feature flags, reports, and system health where available.
- Maintain local, staging, and production environment separation.
- Run QA before launch across auth, builder, upload, AI, export, public publishing, and responsive UI.
- Deploy through GitHub-controlled workflows and protected environments.

## 8. Milestones and Timeline

| Milestone | Description | Target Date | Status |
| --- | --- | --- | --- |
| Phase 1: Design | Wireframes, Figma UI, and database schema are finalized. | July 28, 2026 | Pending |
| Phase 2: MVP Development | Core backend logic, database integration, AI service, exports, uploads, and basic UI are operational. | TBD | Pending |
| Phase 3: Testing | Bug tracking, QA testing, security checks, and user feedback iterations are completed. | TBD | Pending |
| Phase 4: Launch | Final deployment, code cleanup, documentation, and production release are completed. | TBD | Pending |

## 9. Team Roles

- **Project Manager:** Owns scope, timeline, milestones, coordination, and requirement tracking.
- **Frontend Engineer:** Builds the Next.js UI, portfolio builder, dashboard, public pages, and responsive flows.
- **Backend Engineer:** Builds NestJS APIs, authentication, portfolio persistence, uploads, exports, entitlements, and integrations.
- **UI/UX / Product Designer:** Owns Figma design, user flows, creative portfolio templates, accessibility, and visual polish.
- **Tester / QA Engineer:** Tests functional requirements, regression flows, responsive behavior, security expectations, and export output.
- **DevOps Engineer:** Owns GitHub organization setup, CI/CD, cloud hosting, environment configuration, monitoring, and release support.

## 10. GitHub Organization Requirements

- Create or maintain the **VitaCircle** GitHub Organization.
- Host the main repository at `github.com/VitaCircle/vitacircle`.
- Protect the `main` branch with required reviews, required CI checks, and no force pushes.
- Use separate staging and production environments with protected secrets.
- Add CODEOWNERS coverage for frontend, backend, AI, and infrastructure areas.
- Keep the detailed GitHub organization checklist in [github-org.md](github-org.md).

## 11. Acceptance Criteria

- The SRS is the source of truth for future VitaCircle implementation work.
- Requirements are grouped into clear sections and begin the build plan with Authentication.
- The document matches the actual technical stack in the repository.
- Required success and error messages are preserved exactly.
- MVP scope remains focused on portfolio creation, media uploads, AI scoring, and PDF/Word export for creative job seekers.
