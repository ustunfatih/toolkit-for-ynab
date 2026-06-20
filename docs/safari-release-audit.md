# Safari release audit

Last reviewed: 2026-06-20.

## Network behavior

- Required host access: `https://app.ynab.com/*` only.
- Extension settings use browser-local storage.
- Safari runtime contains no Sentry/Raven SDK, crash-report endpoint, or analytics uploader.
- The optional **Google Fonts Selector** feature injects stylesheets from `https://fonts.googleapis.com`. This sends a normal font stylesheet request to Google only when the user selects that feature. Replacing it with bundled fonts before public review would further reduce third-party requests.
- Support, privacy, source, and release links open `github.com/ustunfatih/toolkit-for-ynab` only after a user chooses them.

## Privacy manifest

- Tracking is false and no tracking domains are declared.
- No collected-data categories are declared.
- UserDefaults is declared with reason `CA92.1` for app-owned preferences.
- App Store Connect should use **Data Not Collected** only while these findings remain true.

## Dependencies and licenses

- The project is distributed under MIT; preserve the root `LICENSE` and upstream copyright notice.
- `yarn audit --groups dependencies --level high` reported **0 vulnerabilities across 86 audited production packages** on 2026-06-20.
- `yarn licenses list --production` produced **92 production/transitive license entries** on 2026-06-20; retain this inventory with release records and re-run it for every public release.
- Production JavaScript dependencies include Font Awesome, React, Highcharts, Moment, jQuery, and supporting UI/data libraries. Their transitive license notices should be regenerated and reviewed before public submission.
- Bundled Montserrat WOFF/WOFF2 assets require their applicable font license to accompany distribution. The repository currently has no separate font license file; resolve this before the public Mac App Store submission.
- Google-hosted fonts are not bundled, but their runtime request is disclosed above.

## Release blockers requiring human action

- Paid Apple Developer Program activation.
- Developer ID Application and Apple Distribution certificates.
- Trademark/name/icon review for public use of “YNAB”.
- A stable public privacy-policy page rather than relying permanently on a repository blob URL.
- Reviewer test credentials and App Store listing assets.
