# Editorial Milestone 2 — Visual QA & Design Stability

## Scope

This milestone validates the approved editorial concept at:

- Preview: https://aastha-editorial-concept-preview.onrender.com/
- Repository: p0gchwmp/aastha-skin-centre
- Branch: concept/editorial-interactive-v1

The visual direction is treated as approved. This milestone is refinement and verification only, not a redesign.

## Current structural baseline

Render build audit currently reports:

- 83 concept pages checked
- 0 warnings
- 0 fatal issues
- no unresolved legacy treatment links
- no unresolved legacy blog links
- noindex preserved on the concept preview
- explicit image loading and decoding strategy enforced
- hero image fetch priority enforced

## Automated visual QA

Workflow:

- .github/workflows/editorial-visual-qa.yml
- scripts/editorial_visual_qa.mjs

The workflow builds the exact commit locally before testing so screenshots are deterministic and do not depend on Render deploy timing.

### Viewports

- Desktop: 1440 × 1000
- Tablet: 1024 × 900
- Mobile: 390 × 844

### Representative routes

- Homepage
- Dr. Cheena Langer
- Treatments directory
- Conditions directory
- Acne treatment
- Pigmentation treatment
- Booking
- Karan Nagar
- Blog

### Browser gates

The workflow fails on:

- HTTP errors
- more or fewer than one H1
- concept noindex being lost
- root horizontal overflow
- serious or critical axe accessibility violations
- Explore command palette failing to open/close
- treatment rail failing keyboard navigation
- reduced-motion emulation failing

Moderate axe findings are retained as warnings in the artifact.

### Lighthouse milestone

Both mobile and desktop homepage Lighthouse reports are generated.

Minimum scores:

- Performance: 90
- Accessibility: 95
- Best Practices: 95

The concept is intentionally noindex, so Lighthouse SEO is not used as a pass/fail gate for this preview.

### Evidence artifact

Every run uploads:

- full-page screenshots
- browser QA JSON
- browser QA Markdown summary
- mobile Lighthouse JSON
- desktop Lighthouse JSON
- Lighthouse Markdown summary

Artifact name:

editorial-visual-qa-<commit-sha>

Retention: 7 days.

## Milestone exit criteria

Milestone 2 is complete when all of the following are true:

1. Structural Render audit remains at 0 fatal issues.
2. Visual QA browser checks pass.
3. Serious/critical axe violations are 0.
4. No tested route has horizontal overflow at the three target widths.
5. Lighthouse meets the defined thresholds on mobile and desktop.
6. A screenshot review finds no broken crop, overlap, clipped text, awkward fold, or obviously unbalanced spacing on the representative routes.
7. The concept remains noindex and isolated from production.
8. Production aasthaskincentre.in remains untouched.

## After Milestone 2

The next milestone is CMS parity: carrying this exact approved editorial system into the Wagtail staging implementation without changing public URLs, metadata, structured data, forms, analytics behavior, media ownership, or rollback controls.
