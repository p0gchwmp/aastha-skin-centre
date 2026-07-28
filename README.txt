AASTHA STAGING ACCEPTANCE PATCH V12

You do not need a domain yet.

The next phase is:
1. Keep the temporary Render site out of search indexing.
2. Review every page and collect functional and formatting issues.
3. Fix blockers first.
4. Complete the deeper visual-polish round later.

APPLY

1. Copy this patch into the website source folder.
2. Replace render.yaml.
3. Commit and push the change to GitHub.
4. Render redeploys automatically.
5. Run:
       15_Create_Staging_Audit_Checklist.bat
6. Paste the full onrender.com URL.
7. The clickable audit report opens from the reports folder.

The new Render header is:

    X-Robots-Tag: noindex, nofollow

Remove it only when the final domain is ready and the website is approved for public indexing.
