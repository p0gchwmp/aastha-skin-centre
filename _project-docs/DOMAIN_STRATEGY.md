# Domain Strategy

## Recommended setup

Use **https://www.aasthaskincentre.in/** as the only primary website.

Register **aasthaskincentre.com** as a defensive brand domain if it is available at a normal registration price. Do not publish a second copy of the website on `.com`.

Redirect every alternate version permanently to the primary `.in` domain:

- `http://aasthaskincentre.in/*`
- `https://aasthaskincentre.in/*`
- `http://www.aasthaskincentre.in/*`
- `http://aasthaskincentre.com/*`
- `https://aasthaskincentre.com/*`
- `http://www.aasthaskincentre.com/*`
- `https://www.aasthaskincentre.com/*`

All should resolve to:

- `https://www.aasthaskincentre.in/$path`

## Why `.in` is primary

- The clinic serves patients mainly in Jammu and India.
- The `.in` address clearly matches the clinic's local market.
- The existing website already uses the `.in` brand.
- All current page canonicals and JSON-LD use `www.aasthaskincentre.in`.

## Why also register `.com`

- It protects the clinic name from confusion or impersonation.
- Patients who type `.com` can still reach the correct website.
- It leaves room for future non-India brand use without changing the current site.

## Important SEO rule

The `.com` domain must redirect to `.in` with a permanent `301` or `308` redirect. It must not display a duplicate copy of the site.

## DNS and SSL

Both domains and both `www` hostnames should have valid DNS and SSL certificates before redirects are activated.

## Email

Keep clinic email separate from the public website-domain decision until mailboxes and DNS records are deliberately configured. Do not change the existing clinic email casually because it may affect patient communication.
