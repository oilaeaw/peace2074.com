import Foundation
import WatchConnectivity

/// PhoneWatchBridge sends the current sura/ayah to the Apple Watch
/// whenever the Peace2074 Capacitor app navigates to a new verse.
///
/// Usage (from AppDelegate or a Capacitor plugin):
///   PhoneWatchBridge.shared.send(chapter: 1, verse: 1)
///
/// The Vue layer can call this via a Capacitor plugin or a JS → Swift bridge.
/// For a quick integration without a full plugin, Capacitor's custom notifications
/// can be used:
///   NotificationCenter.default.post(name: .quranVerseChanged,
///       object: nil, userInfo: ["chapter": 1, "verse": 1])

@MainActor
final class PhoneWatchBridge: NSObject, ObservableObject {

    static let shared = PhoneWatchBridge()

    private override init() {
        super.init()
        if WCSession.isSupported() {
            WCSession.default.delegate = self
            WCSession.default.activate()
        }

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleVerseChanged(_:)),
            name: .quranVerseChanged,
            object: nil
        )
    }

    /// Send current verse to Apple Watch.
    /// Uses `updateApplicationContext` so the watch receives it even when not
    /// immediately reachable, and `sendMessage` for real-time updates when
    /// the session is active.
    func send(chapter: Int, verse: Int) {
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        guard session.activationState == .activated else { return }

        let payload: [String: Any] = ["chapter": chapter, "verse": verse]

        do {
            try session.updateApplicationContext(payload)
        } catch {
            print("[PhoneWatchBridge] updateApplicationContext error: \(error)")
        }

        if session.isReachable {
            session.sendMessage(payload, replyHandler: nil, errorHandler: { err in
                print("[PhoneWatchBridge] sendMessage error: \(err)")
            })
        }
    }

    @objc private func handleVerseChanged(_ notification: Notification) {
        guard
            let chapter = notification.userInfo?["chapter"] as? Int,
            let verse   = notification.userInfo?["verse"]   as? Int
        else { return }
        send(chapter: chapter, verse: verse)
    }
}

extension PhoneWatchBridge: WCSessionDelegate {

    nonisolated func session(
        _ session: WCSession,
        activationDidCompleteWith activationState: WCSessionActivationState,
        error: Error?
    ) { }

    nonisolated func sessionDidBecomeInactive(_ session: WCSession) { }

    nonisolated func sessionDidDeactivate(_ session: WCSession) {
        WCSession.default.activate()
    }
}

// MARK: - Notification name

extension Notification.Name {
    /// Post this from anywhere in the app to relay the verse to the watch.
    static let quranVerseChanged = Notification.Name("com.peace2074.app.quranVerseChanged")
}
