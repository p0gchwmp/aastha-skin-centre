# Professional website v28

This release is the direct static-site successor to v27 and can replace the
current GitHub/Render static deployment.

## Content and QA corrections

- Added 10 dedicated, indexable acne education articles.
- Connected every item under “Common signs of acne” to a meaningful article or
  treatment page instead of linking the Acne page to itself.
- Removed main-content self-links across the public site.
- Removed repeated doctor-timing headings, verification-file notes and
  duplicated operational clinic blocks from all 52 clinical pages.
- Preserved all 345 complete FAQ answers.
- Kept one consistent end-of-page sequence for care planning, clinics, FAQs,
  appointment action and medical disclaimer.
- Added source notes to the new patient guides and marked them for Dr. Cheena
  Langer’s final medical approval.

## Site-wide controls and reliability

- `assets/data/site-config.json` is the single build-time source for fee,
  follow-up period, phones, WhatsApp, email, maps, addresses and key hours.
- Appointment requests use one form handler and the configured WhatsApp
  destination.
- CSS and JavaScript use content-hashed URLs after every build.
- V28 QA checks self-links, dedicated blog destinations, duplicate headings,
  internal notes, shared page structure, FAQs, global data and built assets.

## Verified release totals

- 77 built HTML pages
- 75 indexable URLs and 2 intentionally excluded URLs
- 52 clinical pages
- 345 FAQs
- 10 dedicated blog articles
- 539 content-hashed CSS/JavaScript references
- 0 release, link, content-integrity, predeployment or asset errors

Run `30_Verify_Professional_Release_v28.bat` before pushing.
