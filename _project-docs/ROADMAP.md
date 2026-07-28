# Aastha Website Roadmap — Maintenance, Blog and Launch

## Current checkpoint

The static pages have been imported. The next job is to turn the site into a maintainable system rather than repeatedly editing the same fact on dozens of pages.

## Phase 1 — Apply the shared feature patch

1. Copy this patch into the current website folder and overwrite shared files.
2. Run `1_Apply_Global_Settings.bat`.
3. Run website QA.
4. Preview the homepage, one treatment page, both location pages and the appointment page.
5. Test the light/dark theme toggle, Instagram, YouTube and Google Maps links.

## Phase 2 — Improve every saved JSON-LD file

1. Put all saved JSON files under `schema-drop/`; subfolders are allowed.
2. Run `7_Dry_Check_Schema_Upgrade.bat`.
3. Fix only rows marked ERROR.
4. Run `8_Apply_Schema_Upgrade.bat`.
5. Run website QA again.

This replaces minimal fallback schema without changing visible page content.

## Phase 3 — Future fee and repeated-clinic-detail changes

Edit only:

`assets/data/site-config.json`

Then run:

`1_Apply_Global_Settings.bat`

This updates the repeated visible fee, follow-up days, contact details, maps and supported schema contact fields. The local settings editor under `tools/` can download a replacement JSON without hand-editing it.

## Phase 4 — Future static-page changes

For one page:

1. Edit or regenerate that page's DOCX.
2. Put the revised DOCX in `content-drop/`.
3. Keep or add the page's full JSON-LD.
4. Run the content dry check and importer.
5. Run QA.

For layout or branding changes, edit shared CSS/JS once; every page uses the same files.

## Phase 5 — Blog publishing and internal keyword links

1. Copy `blog/post-template/` to a new slug such as `blog/acne-mistakes/`.
2. Replace the metadata, article body and BlogPosting schema.
3. Add a row in `content/blog-keyword-map.csv`.
4. Set `status` to `published`.
5. Put the live blog URL in `target_blog_url`.
6. Run `5_Dry_Check_Blog_Links.bat`.
7. Run `6_Apply_Blog_Links.bat`.
8. Run website QA.

The linker adds only the first suitable keyword occurrence and avoids links, headings, navigation and buttons.

## Phase 6 — Visual and conversion QA

- Replace placeholders with approved doctor and clinic photographs.
- Test dark mode on mobile and desktop.
- Test call, WhatsApp, appointment and Google Maps actions.
- Check text length, spacing, menus and footer on small phones.
- Confirm that Instagram and YouTube profiles open correctly.
- Review all medical pages before launch.

## Phase 7 — Launch

- Keep `.in` as the primary domain.
- Redirect `.com` to `.in`.
- Upload the site to the chosen host.
- Connect both domains and SSL.
- Submit `sitemap.xml` in Google Search Console.
- Verify both clinic Google Business Profiles and website links.
- Monitor indexing, form enquiries and broken links.

## Master sheet

The existing master sheet is being used as the source for URLs, keywords and page priorities. A new upload is only needed if the locally edited master sheet differs from the previously generated copy.
