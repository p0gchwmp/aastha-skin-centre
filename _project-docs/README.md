# Aastha Skin Centre Static Website Starter

This package contains a responsive, reusable static website foundation for Aastha Skin & Dermato-Cosmetic Centre.

## Included

- Shared premium burgundy-and-gold header, mega menus, footer and mobile actions
- P0 pages:
  - Home
  - About
  - Dr. Cheena Langer
  - Conditions overview
  - Treatments overview
  - Karan Nagar location
  - Paloura location
  - Book appointment
  - Contact
  - Privacy Policy
  - Terms & Conditions
  - Medical Disclaimer
  - Appointment acknowledgement
  - 404 page
- Noindex development stubs for all 52 completed medical content pages
- `page-registry.json`
- `robots.txt`
- `sitemap.xml`
- Local WhatsApp appointment-request workflow
- JSON-LD on the core pages

## Preview locally

The site uses root-relative URLs, so preview it through a local web server.

### Windows

Open Command Prompt inside this folder and run:

```bash
py -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

### macOS or Linux

```bash
python3 -m http.server 8000
```

## Appointment form

The starter form validates a 10-digit mobile number and opens WhatsApp with a structured request. It does **not** store patient data on a server.

Before production, decide whether to retain the WhatsApp workflow or connect the form to a secure backend.

## Add full medical content

1. Export the completed ChatGPT page with the Aastha Page Exporter.
2. Open the matching HTML stub listed in `content/page-registry.json`.
3. Replace the yellow developer placeholder with the visible page content.
4. Add the separate JSON-LD file in the page `<head>`.
5. Verify service availability, fee, timings and medical claims.
6. Test the schema and mobile layout.
7. Change the page from `noindex,follow` to `index,follow`.
8. Add the URL to `sitemap.xml`.

## Production checks

- Replace the doctor and clinic image placeholders
- Add the approved clinic logo
- Review Privacy Policy and Terms with qualified legal counsel
- Connect analytics and Search Console only after consent/privacy decisions
- Test all Call, WhatsApp, Maps and appointment links
- Confirm current procedure availability before publishing treatment claims
- Ensure the exact disclaimer appears on every medical page


## Domain decision

Primary website:

`https://www.aasthaskincentre.in/`

Register `aasthaskincentre.com` as a defensive domain if it is available at a normal price, then permanently redirect it to `.in`. See `DOMAIN_STRATEGY.md` and `deployment/`.

## Automated medical-page importer

1. Export each page into DOCX and JSON-LD.
2. Put both files into `content-drop/`.
3. Double-click `Run_Content_Importer.bat`.
4. Review every generated page before deployment.

The importer updates metadata, visible content, schema, robots and the XML sitemap.


## Bulk import workflow

All DOCX and JSON-LD files may be placed together or inside any subfolders under `content-drop/`. Order does not matter.

Use the numbered Windows launchers:

1. `1_Dry_Check_All_Content.bat`
2. `2_Import_All_Content.bat`
3. `3_Run_Website_QA.bat`
4. `4_Preview_Website.bat`

The importer pairs files primarily by the page URL, backs up existing HTML, produces import reports, updates robots directives and rebuilds the XML sitemap.
