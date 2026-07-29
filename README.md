# Aastha Skin & Dermato-Cosmetic Centre — Professional Release v24

This folder is the cleaned, patient-facing static website source.

## What changed

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
30_Verify_Professional_Release_v24.bat
```

Then run:

```text
31_Preview_Professional_Release_v24.bat
```

## Deployment

Render builds with:

```text
python3 scripts/build_static_dist.py
```

and publishes `dist`.
