# Deep links: what the website needs (note for the web team)

The mobile app now opens shared links directly. These website-side items make
the experience complete for people who **don't** have the app, and for links
opened inside Instagram's in-app browser.

## 1. Keep these two files live (already correct today, please don't move them)
Served from the site root, HTTP 200, no redirects, on **www**, the **bare domain**
and **beta**:

- `/.well-known/assetlinks.json` (Android) must be `application/json`
- `/.well-known/apple-app-site-association` (iOS), no file extension

Android's file must list the SHA-256 of the **Play App Signing key** as well as the
upload/debug keys. If a Play-installed build ever stops opening links, check this first.

## 2. Make the share-link paths match real pages
The app generates these share URLs. Every one must render a page:

| Content | Share URL |
|---|---|
| Synopsis | `/synopsys/{id}` (note the spelling) |
| Opportunity | `/opportunities/{id}` |
| Contest | `/contests/{id}` (optional `?influencer=name`) |
| Contest participant | `/contests/{contestId}/participants/{id}` |
| Book / Movie | `/books/{id}` · `/movies/{id}` |
| Post | `/{username}/status/{postId}` |
| Profile | `/{username}` |
| VisionX | `/creators-zone/{id}` |

**VisionX:** the app shares `/creators-zone/{id}`. When I tested the live site with a fake ID, that path returned a 404 while `/vision/{id}` returned 200. Please make sure `/creators-zone/{id}` renders the VisionX detail page (or tell us the correct path).

## 3. Instagram / in-app browsers (small script on the page)
Instagram's in-app browser often does **not** hand links to the installed app.
On each content page, for mobile visitors add an **"Open in app"** button that:

1. Opens the same URL again (Universal/App Links), and
2. Falls back to the store if the app isn't installed.

Sample code for the contest page is in `contest-redirect.js`. Reuse the same idea for
the other content types. Don't auto-redirect, because that causes loops. Use a button.

## 4. Don't create redirect loops
- Don't redirect `www` ↔ bare domain on `/.well-known/*` paths.
- Don't redirect a content URL to an app-store URL on iOS/Android *and* back.
- Unknown/deleted content should return the normal "not found" page, not a redirect.
