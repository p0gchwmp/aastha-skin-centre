# Future Admin Control Panel — Locked Scope

The admin panel is deliberately deferred until the static website, design system and content structure are stable.

## Access and control

- Secure login
- Role-based access: Super Admin, Doctor Reviewer, Content Editor, Reception/Admin
- Two-factor authentication
- Password reset and session controls
- Full audit log showing who changed what and when
- Staging preview before publishing

## Dashboard

- Website health summary
- Pages requiring review
- Draft and published blogs
- Broken-link and schema alerts
- Appointment enquiry counts
- Most-viewed pages and search terms
- Upcoming content-review dates
- Branch information status

## Global settings

- Consultation fee and follow-up policy
- Phone numbers, email and WhatsApp
- Clinic addresses, timings and Google Maps
- Instagram, YouTube and other social links
- Doctor details
- Medical disclaimer
- Emergency wording
- Announcement banner
- Theme defaults

## Static page editor

- Edit headings, paragraphs, FAQs and CTAs
- Save draft, preview and publish
- Revision history and rollback
- Medical-review approval before publishing
- Page-level SEO title, description, canonical and robots
- Internal-link suggestions
- Branch/service availability flags

## Blog manager

- Create, edit, schedule and archive articles
- Blog categories and tags
- Featured images and alt text
- Author and medical reviewer
- BlogPosting schema
- Keyword-to-static-page and static-page-to-blog linking controls
- Related article cards
- Draft preview
- Revision history

## Schema manager

- Page-type schema templates
- Physician and clinic entity settings
- FAQ schema generated from visible FAQs
- Breadcrumb schema
- BlogPosting schema
- Validation report before publishing
- Safe JSON preview for advanced users

## Media library

- Approved clinic and doctor photos
- Image resizing and WebP/AVIF generation
- Alt text
- Usage tracking
- Prevent accidental use of unapproved AI doctor imagery

## Redirects and indexing

- Add 301 redirects
- Detect redirect chains
- XML sitemap regeneration
- Robots and noindex controls
- Search Console submission log

## Safety and governance

- Medical-content approval gate
- Mandatory reason for editing fee, timings or clinical claims
- Automatic backup before every publish
- One-click rollback
- Export all content and settings
- Database backups
- Privacy-preserving appointment data controls

## Architecture decision later

The admin panel should not directly edit production HTML without versioning. The preferred future pattern is an authenticated content system that stores structured content, creates a reviewed build, and deploys only after approval.
