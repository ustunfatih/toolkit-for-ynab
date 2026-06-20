# Safari distribution playbook

The recommended order is permanent private distribution first, TestFlight second, and a public Mac App Store release after the same signed build is stable.

## 1. Prepare the release sources

For the first release build:

```bash
yarn safari:prepare-release --build-number 1
```

For every later build, let the command increment `CURRENT_PROJECT_VERSION`:

```bash
yarn safari:prepare-release
```

Commit the resulting version, generated Xcode project, and Safari resources together. Never reuse an App Store Connect build number.

## 2. Enroll and configure signing

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/enroll/) and wait for activation.
2. In Certificates, Identifiers & Profiles, register the host and extension identifiers listed in the release checklist.
3. In Xcode **Settings > Accounts**, refresh the paid team.
4. Create or download a **Developer ID Application** certificate for direct distribution.
5. Open `safari/Toolkit for YNAB.xcodeproj` and select the paid team for both targets. Keep automatic signing enabled.

The Team ID intentionally is not committed. Xcode stores the selected team locally, or it can be supplied to command-line builds with `DEVELOPMENT_TEAM=YOURTEAMID`.

## 3. Permanent private installation with Developer ID

1. In Xcode choose **Product > Archive** with the **Toolkit for YNAB** scheme and Release configuration.
2. In Organizer choose **Distribute App > Developer ID > Upload**.
3. Keep automatic signing selected and upload for notarization.
4. Wait for Apple to accept the submission, then export the notarized app from Organizer. Confirm the ticket is stapled.
5. Package and verify it:

```bash
yarn safari:package-release --app "/path/to/Toolkit for YNAB.app"
```

The command runs `codesign --verify --deep --strict`, `spctl --assess`, and `stapler validate`, then creates `release/Toolkit-for-YNAB-3.20.0-macOS.zip` with `ditto`.

On each personal Mac:

1. Download and unzip the release.
2. Move **Toolkit for YNAB.app** to `/Applications`.
3. Launch it once and choose **Open Safari Extension Settings**.
4. Enable the extension and allow `app.ynab.com` access.
5. Restart Safari, then restart macOS once during acceptance testing.

This route is permanent and does not require App Review. A Developer ID certificate and successful notarization are required. See Apple’s [Safari distribution guidance](https://developer.apple.com/documentation/safariservices/distributing-your-safari-web-extension) and [notarization workflow](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution).

## 4. TestFlight rehearsal

1. Create a macOS app in App Store Connect using the host bundle ID.
2. Archive again and choose **Distribute App > App Store Connect > Upload**.
3. Resolve Organizer validation issues and upload `3.20.0 (1)` or the current build number.
4. Add your Apple Account as an internal tester and install with TestFlight on each Mac.

TestFlight builds expire after 90 days, so this is a useful submission rehearsal but not the permanent personal-install route. Upload a newer build before expiration. See [TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview).

## 5. Public Mac App Store submission

Complete the App Store section of the release checklist. In particular:

- Publish support and privacy pages at stable public URLs.
- Complete App Privacy with **Data Not Collected** only after repeating the network audit.
- Upload an accepted 16:10 Mac screenshot, such as `2560x1600`.
- Explain in Review Notes that the containing app opens Safari’s Extensions pane and that access is restricted to `app.ynab.com`.
- Supply a reviewer-accessible YNAB test account and non-personal sample budget.
- Resolve branding and trademark permission before submission; open-source licensing does not itself grant trademark rights.

Apple references: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App Privacy](https://developer.apple.com/help/app-store-connect/reference/app-information/app-privacy), and [screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications).

## 6. Troubleshooting signing

List available identities:

```bash
security find-identity -v -p codesigning
```

If only **Apple Development** appears, local Xcode testing can work but Developer ID export cannot. Finish paid enrollment and install a **Developer ID Application** certificate. Do not restore ad-hoc `CODE_SIGN_IDENTITY = -` settings; they are exactly what makes an extension temporary.
