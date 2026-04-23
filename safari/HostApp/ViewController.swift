import Cocoa
import SafariServices

class ViewController: NSViewController {
    private var extensionBundleIdentifier: String {
        guard let hostBundleIdentifier = Bundle.main.bundleIdentifier else {
            return "com.fatihustun.openbudgetforynab.OpenBudget-for-YNAB.Extension"
        }

        return "\(hostBundleIdentifier).Extension"
    }

    private var appName: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ?? "OpenBudget for YNAB"
    }

    private let supportURL = URL(string: "https://github.com/fatihustun/toolkit-for-ynab/issues")!
    private let privacyURL = URL(string: "https://github.com/fatihustun/toolkit-for-ynab/blob/main/privacy-policy.md")!
    private let statusBadge = NSTextField(labelWithString: "Checking Safari extension…")
    private let headlineLabel = NSTextField(labelWithString: "")
    private let detailLabel = NSTextField(wrappingLabelWithString: "")
    private let diagnosticsLabel = NSTextField(wrappingLabelWithString: "")
    private let openSafariButton = NSButton(title: "Open Safari Extension Settings", target: nil, action: nil)
    private let refreshButton = NSButton(title: "Refresh Status", target: nil, action: nil)
    private let supportButton = NSButton(title: "Support", target: nil, action: nil)
    private let privacyButton = NSButton(title: "Privacy", target: nil, action: nil)
    private let activityIndicator = NSProgressIndicator()

    override func loadView() {
        view = NSView()
        view.wantsLayer = true
        view.layer?.backgroundColor = NSColor.windowBackgroundColor.cgColor
        buildInterface()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        refreshExtensionState(nil)
    }

    private func buildInterface() {
        statusBadge.font = .systemFont(ofSize: 12, weight: .semibold)
        statusBadge.alignment = .center
        statusBadge.drawsBackground = true
        statusBadge.isBordered = false
        statusBadge.wantsLayer = true
        statusBadge.layer?.cornerRadius = 999
        statusBadge.layer?.masksToBounds = true
        statusBadge.lineBreakMode = .byTruncatingTail
        statusBadge.maximumNumberOfLines = 1

        let eyebrowLabel = NSTextField(labelWithString: "Unofficial Safari companion for YNAB")
        eyebrowLabel.font = .systemFont(ofSize: 11, weight: .bold)
        eyebrowLabel.textColor = .secondaryLabelColor

        headlineLabel.font = .systemFont(ofSize: 28, weight: .bold)
        headlineLabel.lineBreakMode = .byWordWrapping
        headlineLabel.maximumNumberOfLines = 2

        detailLabel.font = .systemFont(ofSize: 13)
        detailLabel.textColor = .secondaryLabelColor

        diagnosticsLabel.font = .monospacedSystemFont(ofSize: 11, weight: .regular)
        diagnosticsLabel.textColor = .secondaryLabelColor

        activityIndicator.style = .spinning
        activityIndicator.controlSize = .small
        activityIndicator.startAnimation(nil)

        configurePrimaryButton(openSafariButton, action: #selector(openSafariExtensionPreferences(_:)))
        configureSecondaryButton(refreshButton, action: #selector(refreshExtensionState(_:)))
        configureSecondaryButton(supportButton, action: #selector(openSupport(_:)))
        configureSecondaryButton(privacyButton, action: #selector(openPrivacy(_:)))

        let actionsRow = NSStackView(views: [openSafariButton, refreshButton, supportButton, privacyButton])
        actionsRow.orientation = .horizontal
        actionsRow.spacing = 10
        actionsRow.edgeInsets = NSEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)

        let diagnosticsCard = makeCard(
            title: "Diagnostic snapshot",
            body: "The app checks whether Safari sees the extension, shows your bundle identifiers, and reminds you which domains the extension targets."
        )
        diagnosticsCard.addArrangedSubview(diagnosticsLabel)

        let instructionsCard = makeCard(
            title: "Permanent Safari setup on this Mac",
            body: "1. Install or update the app.\n2. Open Safari Settings > Extensions.\n3. Turn on the extension for app.ynab.com.\n4. If Safari disables it after an update, return here and re-open settings."
        )

        let headerStack = NSStackView(views: [eyebrowLabel, headlineLabel, detailLabel])
        headerStack.orientation = .vertical
        headerStack.spacing = 8

        let heroStack = NSStackView(views: [statusBadge, headerStack, actionsRow])
        heroStack.orientation = .vertical
        heroStack.spacing = 16

        let heroCard = makeCard(title: appName, body: "")
        heroCard.addView(heroStack, in: .top)

        let contentStack = NSStackView(views: [heroCard, instructionsCard, diagnosticsCard])
        contentStack.orientation = .vertical
        contentStack.spacing = 16

        let rootStack = NSStackView(views: [activityIndicator, contentStack])
        rootStack.orientation = .vertical
        rootStack.spacing = 16
        rootStack.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(rootStack)

        NSLayoutConstraint.activate([
            rootStack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 28),
            rootStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -28),
            rootStack.topAnchor.constraint(equalTo: view.topAnchor, constant: 28),
            rootStack.bottomAnchor.constraint(lessThanOrEqualTo: view.bottomAnchor, constant: -28)
        ])

        applyStatusStyle(isEnabled: false, title: "Checking Safari status")
        headlineLabel.stringValue = "Preparing your Safari extension status"
        detailLabel.stringValue = "We are checking whether Safari currently recognizes this copy of the extension."
    }

    private func configurePrimaryButton(_ button: NSButton, action: Selector) {
        button.target = self
        button.action = action
        button.bezelStyle = .rounded
        button.controlSize = .large
        button.contentTintColor = .white
        button.wantsLayer = true
        button.layer?.backgroundColor = NSColor.systemBlue.cgColor
        button.layer?.cornerRadius = 10
    }

    private func configureSecondaryButton(_ button: NSButton, action: Selector) {
        button.target = self
        button.action = action
        button.bezelStyle = .rounded
        button.controlSize = .large
    }

    private func makeCard(title: String, body: String) -> NSStackView {
        let titleLabel = NSTextField(labelWithString: title)
        titleLabel.font = .systemFont(ofSize: 16, weight: .semibold)

        let bodyLabel = NSTextField(wrappingLabelWithString: body)
        bodyLabel.font = .systemFont(ofSize: 13)
        bodyLabel.textColor = .secondaryLabelColor
        bodyLabel.maximumNumberOfLines = 0

        let stack = NSStackView(views: [titleLabel, bodyLabel])
        stack.orientation = .vertical
        stack.spacing = 8
        stack.edgeInsets = NSEdgeInsets(top: 18, left: 18, bottom: 18, right: 18)
        stack.wantsLayer = true
        stack.layer?.backgroundColor = NSColor.controlBackgroundColor.withAlphaComponent(0.9).cgColor
        stack.layer?.cornerRadius = 18
        return stack
    }

    private func applyStatusStyle(isEnabled: Bool, title: String) {
        statusBadge.stringValue = title
        statusBadge.backgroundColor = isEnabled
            ? NSColor.systemGreen.withAlphaComponent(0.14)
            : NSColor.systemOrange.withAlphaComponent(0.16)
        statusBadge.textColor = isEnabled ? .systemGreen : .systemOrange
    }

    private func updateDiagnostics(state: SFSafariExtensionState?) {
        let enabledText = state?.isEnabled == true ? "enabled" : "disabled"
        diagnosticsLabel.stringValue = """
        Extension Bundle ID: \(extensionBundleIdentifier)
        Host Bundle ID: \(Bundle.main.bundleIdentifier ?? "Unavailable")
        Safari State: \(enabledText)
        Supported Domains: app.ynab.com, app.youneedabudget.com
        """
    }

    @IBAction func refreshExtensionState(_ sender: AnyObject?) {
        activityIndicator.startAnimation(nil)
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { [weak self] (state, error) in
            DispatchQueue.main.async {
                guard let self = self else { return }
                self.activityIndicator.stopAnimation(nil)

                if let error = error {
                    self.applyStatusStyle(isEnabled: false, title: "Could not verify Safari status")
                    self.headlineLabel.stringValue = "Safari could not report the extension state"
                    self.detailLabel.stringValue = "Open Safari manually, then use the button below to jump straight to the Extensions pane. Error: \(error.localizedDescription)"
                    self.updateDiagnostics(state: nil)
                    return
                }

                guard let state = state else {
                    self.applyStatusStyle(isEnabled: false, title: "No Safari state returned")
                    self.headlineLabel.stringValue = "The extension was not found in Safari yet"
                    self.detailLabel.stringValue = "Generate the Xcode project again if bundle identifiers changed, then relaunch the app and re-open Safari settings."
                    self.updateDiagnostics(state: nil)
                    return
                }

                self.updateDiagnostics(state: state)

                if state.isEnabled {
                    self.applyStatusStyle(isEnabled: true, title: "Enabled in Safari")
                    self.headlineLabel.stringValue = "\(self.appName) is ready on this Mac"
                    self.detailLabel.stringValue = "Open the YNAB web app in Safari and your local settings will be applied automatically. If Safari disables the extension after an update, return here and refresh this status."
                } else {
                    self.applyStatusStyle(isEnabled: false, title: "Needs Safari approval")
                    self.headlineLabel.stringValue = "Turn on the extension in Safari Settings"
                    self.detailLabel.stringValue = "Use the button below to open Safari’s Extensions settings. After enabling it, return here and choose Refresh Status."
                }
            }
        }
    }

    @IBAction func openSafariExtensionPreferences(_ sender: AnyObject?) {
        activityIndicator.startAnimation(nil)

        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            DispatchQueue.main.async {
                self.activityIndicator.stopAnimation(nil)
                if let error = error {
                    let alert = NSAlert()
                    alert.messageText = "Could not open Safari Settings"
                    alert.informativeText = "Error: \(error.localizedDescription)\n\nOpen Safari manually and go to Safari > Settings > Extensions."
                    alert.alertStyle = .warning
                    alert.addButton(withTitle: "OK")
                    alert.runModal()
                    return
                }
                self.detailLabel.stringValue = "Safari Settings was opened. Enable the extension there, then return here and choose Refresh Status."
            }
        }
    }

    @IBAction func openSupport(_ sender: AnyObject?) {
        NSWorkspace.shared.open(supportURL)
    }

    @IBAction func openPrivacy(_ sender: AnyObject?) {
        NSWorkspace.shared.open(privacyURL)
    }
}
