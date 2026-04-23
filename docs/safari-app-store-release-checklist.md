# Safari App Store Release Checklist

Use this checklist before submitting the macOS host app + Safari extension to App Store Connect.

## 1. Code Health Gates

- [ ] `yarn lint` passes.
- [ ] `yarn type-check` passes.
- [ ] `yarn test --runInBand` passes.
- [ ] `yarn build:safari` passes with no blocking warnings.
- [ ] `yarn safari:build --skip-web-build` successfully refreshes `safari/Extension/_Resources`.

## 2. Safari Extension Packaging

- [ ] `src/manifest.safari.json` has only required permissions.
- [ ] Host permissions are scoped to production domains actually needed by the extension.
- [ ] `safari/Extension/_Resources/manifest.json` is regenerated from the latest source before archive.
- [ ] Extension and host app versions match (`package.json`, `MARKETING_VERSION`, `CFBundleShortVersionString`).
- [ ] `CURRENT_PROJECT_VERSION` / build number is incremented for each upload.

## 3. Signing, Identifiers, and Teams

- [ ] Bundle identifiers are unique for your fork and Apple account.
- [ ] Xcode target Team is your own developer team (host app + extension).
- [ ] Signing style is valid for App Store distribution in Release builds.
- [ ] Entitlements match expected sandbox requirements.

## 4. Privacy and Compliance

- [ ] `PrivacyInfo.xcprivacy` accurately reflects collected data and accessed APIs.
- [ ] App Store Connect privacy answers match runtime behavior and confirm that third-party telemetry is disabled unless intentionally reintroduced.
- [ ] In-app and repo privacy policy matches real data handling.
- [ ] Third-party SDK declarations are complete and current.

## 5. App UX and Store Metadata

- [ ] Host app launches and correctly opens Safari extension settings.
- [ ] First-run instructions clearly explain how to enable the extension in Safari and how to recover after Safari disables it during an update.
- [ ] App icon set and extension icons are complete and high quality.
- [ ] App Store listing assets prepared: subtitle, description, keywords, support URL, privacy URL, screenshots.

## 6. Functional QA (Safari)

- [ ] Extension enables successfully from Safari Settings > Extensions.
- [ ] Popup loads without errors.
- [ ] Options page loads and persists settings.
- [ ] Content scripts execute only on intended YNAB domains.
- [ ] No critical console/runtime errors in background page or page context.

## 7. Release Pipeline

- [ ] Archive with Xcode `Release` configuration.
- [ ] Validate archive in Organizer.
- [ ] Upload to App Store Connect.
- [ ] Complete TestFlight smoke test before production release.
- [ ] Tag and document release notes in your fork.

## 8. Fork-Safety Guardrails

- [ ] Ensure `origin` points to your fork and `upstream` is read-only.
- [ ] Create PRs only against branches in your fork.
- [ ] Never push release branches directly to the upstream project.
