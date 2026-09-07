---
name: Hero Verticals Upgrade
overview: Replace the plain Creative Disciplines grid and upgrade the hero with a richer visual experience—discipline-specific icons, photography, bento layout, and a smarter animated hero with live portfolio preview imagery.
todos:
  - id: verticals-meta-icons
    content: Create verticalIcons.tsx, verticalMeta.ts, and bento CSS for DisciplinesShowcase
    status: completed
  - id: disciplines-showcase
    content: Build DisciplinesShowcase bento grid with images, icons, block chips, hover/scroll animations
    status: completed
  - id: hero-preview
    content: Build HeroPortfolioPreview with device frame, image thumbnails, floating satellite cards
    status: completed
  - id: hero-upgrade
    content: "Upgrade HeroSection: gradient headline, trust row, scroll cue, Ken Burns bg, mouse tilt"
    status: completed
  - id: wire-landing
    content: Swap VerticalsSection for DisciplinesShowcase in LandingPage; update landingCopy
    status: completed
  - id: feature-icons-verify
    content: "Optional: replace feature unicode icons with SVG set; run web build"
    status: completed
isProject: false
---

# Landing Hero & Verticals Upgrade

## Problem

The current **Creative disciplines** section ([`VerticalsSection.tsx`](apps/web/src/components/landing/VerticalsSection.tsx)) is a flat 3×3 grid of text-only cards — no icons, no images, no visual hierarchy. It feels like a placeholder compared to the rest of the page.

The **hero** ([`HeroSection.tsx`](apps/web/src/components/landing/HeroSection.tsx)) works but the right-side mockup is abstract CSS blocks; it doesn't sell the product visually.

## Design direction

Keep landing brand tokens (blue/teal, Fraunces, glass cards, AOS + Framer Motion). Make these two sections **image-forward and icon-rich**, similar to premium SaaS landing pages (Linear, Framer, Notion-style bento grids).

---

## 1. Replace Verticals section entirely

**Remove:** Plain text grid + generic copy block ("Nine verticals. One platform.").

**Replace with:** `DisciplinesShowcase` — a **bento grid** where each of the 9 verticals gets:

| Element | Detail |
|---------|--------|
| **Custom SVG icon** | Per vertical (palette, camera, pen, waveform, film strip, etc.) — inline SVGs in `verticalIcons.tsx`, no new npm deps |
| **Background image** | Mapped from existing [`apps/web/public/`](apps/web/public/) photos + CSS gradient overlays per card |
| **Short tagline** | One line per discipline (editable in `landingCopy.ts`) |
| **Block chips** | 2–3 mini tags showing relevant block types (e.g. Photography → Gallery, Project) from `@vitacircle/shared` |
| **Hover motion** | Framer: scale image, icon glow, border accent; AOS: staggered fade-up on scroll |

### Layout (bento, not uniform grid)

```
┌─────────────────┬──────────┬──────────┐
│  UX/UI (2×2)    │ Graphic  │ Photo    │
│  large + image  │ design   │          │
├────────┬────────┼──────────┴──────────┤
│ Music  │ Film   │  Illustration (wide)  │
├────────┴────────┼──────────┬──────────┤
│ Fashion         │ Writing  │ Arch      │
└─────────────────┴──────────┴──────────┘
```

Featured verticals (UX/UI, Photography, Film) get **larger cells** with full-bleed background images.

### Image mapping (reuse existing assets)

| Vertical | Image | Icon theme |
|----------|-------|------------|
| UX/UI | `computer-bg1.jpg` | Layout/grid icon |
| Photography | `4291.jpg` | Camera icon |
| Graphic design | gradient + icon only | Pen/bezier icon |
| Music/Audio | abstract waveform | Waveform icon |
| Film/Motion | `student-with-bag-bg.jpg` | Play/film icon |
| Illustration | `student-with-books-bg.jpg` | Brush icon |
| Fashion | gradient accent | Hanger icon |
| Writing | `student-researching-bg.jpg` | Type icon |
| Architecture | `computer-bg1.jpg` (crop) | Blueprint icon |

Download 1–2 free Unsplash-style images only if existing photos feel repetitive (optional, not required for v1).

### New files

- `apps/web/src/components/landing/DisciplinesShowcase.tsx` — replaces `VerticalsSection.tsx`
- `apps/web/src/components/landing/verticalIcons.tsx` — 9 SVG icon components
- `apps/web/src/components/landing/verticalMeta.ts` — image paths, block chips, taglines per vertical
- Update [`landingCopy.ts`](apps/web/src/components/landing/landingCopy.ts) — new section title/copy (less generic)
- Update [`landing.module.css`](apps/web/src/components/landing/landing.module.css) — `.bentoGrid`, `.bentoCard`, `.bentoCardFeatured`, `.verticalIcon`, `.blockChip`

### Suggested new copy (placeholder)

- **Eyebrow:** "Built for every creative field"
- **Title:** "Show your work the way your industry expects it."
- **Body:** "Each discipline gets tailored blocks, templates, and layouts — gallery for photographers, audio for musicians, case studies for UX."

---

## 2. Hero section upgrade

**Keep:** Logo badge, headline, CTAs, student photo background, gradient scrim.

**Improve:**

### A. Rich portfolio preview (replace CSS mockup)

Replace abstract blocks with a **multi-layer hero visual**:

1. **Main device frame** — glass browser chrome with a realistic mini portfolio inside:
   - Hero block with name + headline placeholder
   - Project card with thumbnail strip (use cropped portions of public JPGs as thumbnails)
   - AI score badge (87) floating top-right with pulse animation
2. **Floating satellite cards** (Framer Motion parallax on scroll):
   - Small card: "Role-fit score 87" with mini ring
   - Small card: PDF export icon + "Export ready"
   - Small card: Live URL pill `username.vitacircle.app`
3. **Subtle mesh gradient** behind mockup (CSS, not image)

### B. Hero layout polish

- Add **trust row** below CTAs: "Free to start · No card required · 9 creative fields"
- **Headline accent:** highlight key phrase ("tailor to the role") with gradient text (`background-clip: text`)
- **Dual-column balance:** slightly widen mockup column; add `min-height: 100vh` with better vertical centering
- **Scroll cue:** animated chevron at bottom (Framer bounce) hinting more content below

### C. Motion upgrades

| Element | Animation |
|---------|-----------|
| Headline words | Staggered word fade-up (Framer) |
| Mockup | Float + subtle 3D tilt on mouse move (`useMotionValue` / `useTransform`) |
| Satellite cards | Stagger in after mockup, independent float loops |
| AI score badge | Count-up 0→87 on load |
| Background photo | Slow Ken Burns scale (1 → 1.05 over 20s) |

Respect `prefers-reduced-motion`.

### Files to change

- [`HeroSection.tsx`](apps/web/src/components/landing/HeroSection.tsx) — restructure visual column
- New: `HeroPortfolioPreview.tsx` — device frame + floating cards
- [`landing.module.css`](apps/web/src/components/landing/landing.module.css) — hero visual styles, gradient text, trust row, scroll cue
- [`landingCopy.ts`](apps/web/src/components/landing/landingCopy.ts) — trust row strings

---

## 3. Optional: upgrade feature icons too

The features grid still uses unicode symbols (`◎`, `▶`). While touching verticals, swap to **matching SVG icon set** in `featureIcons.tsx` for consistency. Low effort, high polish — include if time permits.

---

## 4. Wiring

In [`LandingPage.tsx`](apps/web/src/components/landing/LandingPage.tsx):

```tsx
// Replace:
<VerticalsSection />
// With:
<DisciplinesShowcase />
```

Delete or deprecate `VerticalsSection.tsx` after migration.

---

## Verification

1. `npm run build -w @vitacircle/web` passes
2. Hero: portfolio preview visible, floating cards animate, headline gradient renders
3. Disciplines: bento grid shows icons + images on desktop; stacks cleanly on mobile
4. No broken images — all paths resolve from `/public`
5. Reduced motion: static fallbacks, no infinite loops

## Out of scope

- Supabase migration (separate plan)
- New photography shoots — reuse existing assets + SVG icons
- Video backgrounds
