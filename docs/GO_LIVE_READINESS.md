# Editorial Preview — Go-Live Readiness

Target is locked to:

- Repository: `p0gchwmp/aastha-skin-centre`
- Branch: `concept/editorial-interactive-v1`
- Render service: `aastha-editorial-concept-preview`
- Preview: `https://aastha-editorial-concept-preview.onrender.com/`

Production is not modified by this milestone.

## Milestone 5 — SEO, entity and performance hardening

The preview remains `noindex,nofollow` and its active `robots.txt` remains blocked from crawling.

The build prepares and validates the production-target SEO layer:

- one canonical production URL per public route
- production-target title and meta description
- Open Graph metadata
- Twitter card metadata
- controlled JSON-LD for WebPage / MedicalWebPage / Article / ProfilePage / CollectionPage / ContactPage, with Physician and MedicalClinic entities where appropriate
- canonical route uniqueness
- required patient actions: booking, WhatsApp, telephone and branch directions
- exactly one H1 on every public route
- separate prelaunch sitemap and robots candidates
- a SHA-256 launch-readiness fingerprint tied to the rendered route set

Generated build artifacts:

- `dist/prelaunch/sitemap.xml`
- `dist/prelaunch/robots.txt`
- `dist/prelaunch/routes.json`
- `dist/prelaunch/launch-readiness.json`

These files are rehearsal artifacts. They do not replace the preview robots file.

## Fail-closed launch gate

The preview build fails if a public page loses noindex, points its canonical at a preview route, misses core social metadata, contains invalid controlled JSON-LD, duplicates a canonical, loses a required core route, loses booking/contact/map actions, or produces a mismatched sitemap.

A green manifest means **technical rehearsal passed only**. It explicitly records:

- `explicit_go_live_required: true`
- `production_activation_performed: false`
- `preview_indexing_locked: true`

## Remaining launch sequence

1. Finish this preview milestone and review the rendered site on mobile/desktop.
2. Run the final launch rehearsal: redirects, analytics, production robots/sitemap, cache/CDN behavior and rollback.
3. Stop at the production gate.
4. Deploy only after an explicit `GO LIVE` instruction.
