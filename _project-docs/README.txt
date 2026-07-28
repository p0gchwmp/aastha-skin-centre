AASTHA STAGING DEPLOYMENT PATCH V6

This patch prepares the website for a clean staging deployment without building
the future admin panel or applying the saved JSON-LD upgrade.

COPY INTO THE CURRENT WEBSITE FOLDER

Choose Replace/Overwrite when asked.

RUN LOCALLY

1. 3_Run_Website_QA.bat
2. 9_Run_Predeploy_Check.bat
3. 10_Build_Clean_Deployment_Folder.bat

WHAT IT ADDS

- Render Blueprint for a static site
- Clean dist build that excludes local/private working files
- Strict predeployment audit
- GitHub Actions QA workflow
- Security and cache headers
- Legacy URL redirects
- Staging deployment guide
- Detailed future admin-panel backlog
- Detailed formatting and micro-polish backlog

THE ADMIN PANEL, FULL JSON-LD UPGRADE AND DEEP VISUAL POLISH REMAIN LATER PHASES.
