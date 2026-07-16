# Safari release checklist

Complete the shared gates before every direct, TestFlight, or Mac App Store build.

## Shared gates

- [ ] Paid Apple Developer Program membership is active.
- [ ] Host App ID is `com.ustunfatih.toolkitforynab`.
- [ ] Extension App ID is `com.ustunfatih.toolkitforynab.Extension`.
- [ ] Both targets use the paid team and automatic signing; no signing identity is hardcoded.
- [ ] Version is `3.20.0`; build number is unique for this upload.
- [ ] `yarn lint` passes.
- [ ] `yarn type-check` passes.
- [ ] `yarn test --runInBand` passes.
- [ ] `yarn safari:prepare-release --build-number 1` passes for the first release; omit the flag to increment later builds.
- [ ] `yarn safari:audit-release` passes.
- [ ] Safari requests only `https://app.ynab.com/*` and `storage`.
- [ ] Runtime contains no Sentry, Raven, analytics, or crash-report upload.
- [ ] Privacy manifest and public privacy policy match runtime behavior.
- [ ] Current dependency, network, privacy, and license findings in `docs/safari-release-audit.md` are reviewed.

## Direct Developer ID distribution

- [ ] A **Developer ID Application** certificate is present in Keychain.
- [ ] Release archive has Hardened Runtime enabled and valid host/extension signatures.
- [ ] Organizer **Developer ID > Upload** notarization succeeds.
- [ ] Exported app has a stapled notarization ticket.
- [ ] `yarn safari:package-release --app "/path/to/Toolkit for YNAB.app"` passes and creates the versioned ZIP.
- [ ] ZIP is tested through Gatekeeper on a second Mac before publishing privately.

## TestFlight and Mac App Store

- [ ] App Store Connect macOS app record uses the host bundle ID.
- [ ] Build `3.20.0 (N)` validates and uploads through Organizer.
- [ ] Privacy URL and support URL are public without authentication.
- [ ] App Privacy answers declare no collected data, unless a fresh audit proves otherwise.
- [ ] At least one accepted 16:10 Mac screenshot is uploaded, such as `2560x1600`.
- [ ] Description, subtitle, keywords, Productivity category, age rating, availability, copyright, and export compliance are complete.
- [ ] Review notes explain Safari enablement and the `app.ynab.com` permission.
- [ ] Reviewer receives a working sample YNAB account and budget that contains no personal data.
- [ ] Name, icon, YNAB references, upstream attribution, and trademark usage have been cleared before public submission.

## Clean-Mac acceptance

- [ ] First launch discovers the extension.
- [ ] Enable, disable, and website-permission changes behave correctly.
- [ ] Extension remains installed after Safari and macOS restarts.
- [ ] Popup and options pages load; settings survive restart.
- [ ] Representative budget, account, report, and bulk-edit features work.
- [ ] Updating over an older signed build preserves settings.
- [ ] No **Allow Unsigned Extensions** setting is required.

## Fork safety

- [ ] `origin` is `ustunfatih/toolkit-for-ynab`.
- [ ] Release PR targets `origin/develop` inside the fork.
- [ ] Nothing is pushed and no PR is opened against `toolkit-for-ynab/toolkit-for-ynab`.
