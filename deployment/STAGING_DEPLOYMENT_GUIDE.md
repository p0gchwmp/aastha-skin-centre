# Staging Deployment Guide — Render

## Goal

Create a private working deployment on Render first, test it thoroughly, and connect the final `.in` domain only after the site is approved.

## Before uploading to GitHub

Run these locally in the website folder:

1. `3_Run_Website_QA.bat`
2. `9_Run_Predeploy_Check.bat`
3. `10_Build_Clean_Deployment_Folder.bat`

The clean public website will be produced inside `dist/`. Local folders such as `.venv`, backups, reports, content-drop and schema-drop are deliberately excluded.

## GitHub repository

1. Create a new private GitHub repository.
2. Copy this deployment patch into the website project.
3. Commit the source project, including `render.yaml`, `.github`, `scripts`, HTML, CSS and JavaScript.
4. Do not commit `.venv`, reports, backups, DOCX files or saved schema-drop files.
5. Push to the `main` branch.

The GitHub workflow runs page QA, predeployment checks and a clean build for every push and pull request.

## Render staging site

1. In Render, create a new Blueprint or Static Site from the GitHub repository.
2. Render reads `render.yaml`.
3. The build command creates `dist/`.
4. The static publish path is `./dist`.
5. Leave the temporary `onrender.com` address enabled during staging.
6. Test every main page, mobile menu, dark mode, call button, WhatsApp link, maps link and appointment flow.

## Custom domain later

After staging approval:

1. Add `www.aasthaskincentre.in` under the Render service’s Custom Domains.
2. Follow the exact DNS records Render displays.
3. Verify the custom domain.
4. Render automatically provisions and renews TLS.
5. Keep the root `.in` domain redirecting to the chosen `www` primary.
6. Redirect `.com` to the matching `.in` URL with the path and query string preserved.

Do not connect the production domain before the visual, medical and conversion review is complete.
