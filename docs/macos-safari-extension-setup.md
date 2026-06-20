# macOS Safari development setup

`safari/project.yml` is the source of truth. The checked-in Xcode project is generated with XcodeGen and must not be edited as the permanent configuration source.

## Prerequisites

- macOS with Xcode 15 or later.
- Node.js, Yarn, and XcodeGen (`brew install xcodegen`).
- An Apple ID selected in Xcode. A free Personal Team is enough for local debugging; permanent direct distribution requires paid Apple Developer Program membership.

## Build and run

```bash
yarn install
yarn safari:build-full
open "safari/Toolkit for YNAB.xcodeproj"
```

In Xcode:

1. Select the **Toolkit for YNAB** scheme and **My Mac** destination.
2. Open **Signing & Capabilities** for both targets and select your team. Keep **Automatically manage signing** enabled.
3. Run the host app.
4. Choose **Open Safari Extension Settings** in the host app.
5. Enable **Toolkit for YNAB** and grant access only to `app.ynab.com`.

The bundle identifiers are fixed to:

- Host: `com.ustunfatih.toolkitforynab`
- Extension: `com.ustunfatih.toolkitforynab.Extension`

Do not commit a personal Team ID or files under `xcuserdata`.

## Refresh after web-extension changes

```bash
yarn safari:build-full
```

This rebuilds the web extension, syncs version metadata, copies `dist/extension` to the Safari target, and regenerates the Xcode project.

## Local-signing limitation

An app run with a free Personal Team or unsigned-extension development mode is for testing only. Use the Developer ID workflow in [the distribution playbook](./safari-distribution-playbook.md) for a permanent installation.
