# Aastha Skin & Dermato-Cosmetic Centre

Static website source for **Aastha Skin & Dermato-Cosmetic Centre, Jammu**.

## Technology

- Semantic HTML
- Shared CSS and JavaScript
- Static page generation and validation with Python
- Render static-site deployment
- GitHub Actions quality checks

## Local verification

Run the local control menu:

```text
Aastha_Tools.bat
```

The Windows BAT files are intentionally kept out of GitHub. They remain available in the local working folder.

## Deployment

Render uses:

```text
Build command: python3 scripts/build_static_dist.py
Publish directory: dist
```

The build script creates a clean public folder and excludes local reports, backups, DOCX exports, schema working files and development tools.

## Primary domain

The production canonical domain is:

```text
https://www.aasthaskincentre.in/
```

The `.com` domain, when registered, should permanently redirect to the matching `.in` URL.

## Medical review

Medical pages must be reviewed before production publication. Website information does not replace an individual medical consultation.
