# Aastha Skin & Dermato-Cosmetic Centre — Professional Release v26

This folder is the cleaned, patient-facing static website source.

## What changed

- Automatic content-hashed CSS and JavaScript URLs prevent stale Render/browser assets after deployment
- Corrected the repeated spacing defect before “How care is planned” on long treatment pages
- Site-wide dark-mode contrast fixes for FAQs, article cards, lists and sidebars
- Responsive long-page grid fixes to prevent clipped consultation cards
- Restrained typography and spacing inside imported expandable content
- Empty heading-only sections removed across treatment pages
- Patient-facing HIFU versus RF comparison page completed
- Visible legal drafting notes removed
- Unique social descriptions plus Open Graph image and Twitter card metadata
- Concise appointment, contact, about, doctor and location pages
- Card-based Conditions and Treatments directories with working links
- Working Blog directory and `/blog` → `/blog/` redirect
- Consistent sentence-case labels and CTAs
- Proper lists instead of loose text runs
- Long treatment details grouped into optional expandable sections
- High-contrast light and dark themes
- Responsive desktop and mobile layouts
- Staging remains `noindex` until a production domain is connected

## Verify locally

Run:

```text
30_Verify_Professional_Release_v26.bat
```

Then run:

```text
31_Preview_Professional_Release_v26.bat
```

## Deployment

Render builds with:

```text
python3 scripts/build_static_dist.py
```

and publishes `dist`.
