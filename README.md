# Aastha Skin Centre — static release v28

See `RELEASE_NOTES_V28.md` for the exact fixes, totals and deployment scope.

This is the drop-in update for the existing Render Static Site.

## V28 corrections

- Blackheads, whiteheads and the other acne signs now open meaningful dedicated guides or the relevant scar page instead of reopening the Acne page.
- Added ten complete blog guides and rebuilt the Blog directory around real article pages.
- Removed all main-content self-links found by the release audit.
- Removed repeated “Dr. Cheena Langer’s timings” blocks and internal verification-file wording.
- Normalised all 52 clinical pages to one care block, one clinic block, one FAQ section, one final CTA and one disclaimer.
- Added a build-time global clinic configuration layer for consultation fee, follow-up period, phone numbers, addresses, maps and hours.
- Added v28 content-graph QA for self-links, duplicate timings, internal notes, broken destinations and global facts.
- Retains the v27 FAQ recovery, content integrity, cache-busting, responsive layout and dark-mode fixes.

## Verify and preview on Windows

Run:

```text
30_Verify_Professional_Release_v28.bat
31_Preview_Professional_Release_v28.bat
```

The deployable output is rebuilt in `dist/`.

## Existing Render Static Site

- Build command: `python3 scripts/build_static_dist.py`
- Publish directory: `dist`
- Staging remains protected with `noindex, nofollow`

For visual page editing, new doctors/clinics, drag-and-drop sections, uploaded
media, revisions and global changes from an admin screen, use the separate
`aastha-skin-centre-cms-v28` release.
