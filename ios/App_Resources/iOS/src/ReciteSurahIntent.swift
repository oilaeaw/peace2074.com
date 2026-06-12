import AppIntents
import Foundation

@objc class SurahResolver: NSObject {
    static let pendingDeepLinkKey = "peace2074.pendingDeepLink"
    static let reciteNotification = Notification.Name("Peace2074ReciteSurah")

    // Index = sura id - 1.
    static let transliterations: [String] = [
        "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa", "Al-Ma'idah",
        "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
        "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr",
        "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Taha",
        "Al-Anbya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan",
        "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum",
        "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir",
        "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
        "Fussilat", "Ash-Shuraa", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah",
        "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
        "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman",
        "Al-Waqi'ah", "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah",
        "As-Saf", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq",
        "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
        "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah",
        "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "'Abasa",
        "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj",
        "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad",
        "Ash-Shams", "Al-Layl", "Ad-Duhaa", "Ash-Sharh", "At-Tin",
        "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat",
        "Al-Qari'ah", "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil",
        "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr",
        "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
    ]

    // Index = sura id - 1. English meanings, used as an extra matching source.
    static let translations: [String] = [
        "The Opener", "The Cow", "Family of Imran", "The Women", "The Table Spread",
        "The Cattle", "The Heights", "The Spoils of War", "The Repentance", "Jonah",
        "Hud", "Joseph", "The Thunder", "Abraham", "The Rocky Tract",
        "The Bee", "The Night Journey", "The Cave", "Mary", "Ta-Ha",
        "The Prophets", "The Pilgrimage", "The Believers", "The Light", "The Criterion",
        "The Poets", "The Ant", "The Stories", "The Spider", "The Romans",
        "Luqman", "The Prostration", "The Combined Forces", "Sheba", "Originator",
        "Ya Sin", "Those who set the Ranks", "Saad", "The Troops", "The Forgiver",
        "Explained in Detail", "The Consultation", "The Ornaments of Gold", "The Smoke", "The Crouching",
        "The Wind-Curved Sandhills", "Muhammad", "The Victory", "The Rooms", "Qaf",
        "The Winnowing Winds", "The Mount", "The Star", "The Moon", "The Beneficent",
        "The Inevitable", "The Iron", "The Pleading Woman", "The Exile", "She that is to be examined",
        "The Ranks", "Friday", "The Hypocrites", "The Mutual Disillusion", "The Divorce",
        "The Prohibition", "The Sovereignty", "The Pen", "The Reality", "The Ascending Stairways",
        "Noah", "The Jinn", "The Enshrouded One", "The Cloaked One", "The Resurrection",
        "The Man", "The Emissaries", "The Tidings", "Those who drag forth", "He Frowned",
        "The Overthrowing", "The Cleaving", "The Defrauding", "The Sundering", "The Mansions of the Stars",
        "The Nightcommer", "The Most High", "The Overwhelming", "The Dawn", "The City",
        "The Sun", "The Night", "The Morning Hours", "The Relief", "The Fig",
        "The Clot", "The Power", "The Clear Proof", "The Earthquake", "The Courser",
        "The Calamity", "The Rivalry in world increase", "The Declining Day", "The Traducer", "The Elephant",
        "Quraysh", "The Small kindnesses", "The Abundance", "The Disbelievers", "The Divine Support",
        "The Palm Fiber", "The Sincerity", "The Daybreak", "Mankind"
    ]

    // Common spoken / alternate spellings that differ from the transliteration.
    static let aliases: [String: Int] = [
        "yaseen": 36, "yasin": 36, "yseen": 36,
        "baqara": 2, "baqarah": 2,
        "imran": 3, "aliimran": 3,
        "nisa": 4, "nisaa": 4,
        "maidah": 5, "maida": 5,
        "anam": 6,
        "araf": 7,
        "anfal": 8,
        "tawba": 9, "tauba": 9, "tawbah": 9,
        "rad": 13,
        "isra": 17, "israa": 17,
        "kahf": 18,
        "anbiya": 21, "anbya": 21,
        "muminun": 23, "mominoon": 23,
        "furqan": 25,
        "ankabut": 29,
        "sajda": 32, "sajdah": 32,
        "ahzab": 33,
        "yaa sin": 36, "yaaseen": 36,
        "rahman": 55, "rehman": 55, "arrahman": 55,
        "waqia": 56, "waqiah": 56, "waqiya": 56,
        "mujadila": 58,
        "mulk": 67, "almulk": 67,
        "qalam": 68,
        "haqqa": 69, "haqqah": 69,
        "muzammil": 73, "muzzammil": 73,
        "mudathir": 74, "muddathir": 74,
        "qiyama": 75, "qiyamah": 75,
        "naba": 78, "nabaa": 78,
        "ikhlas": 112, "tawheed": 112, "tawhid": 112,
        "falaq": 113,
        "nas": 114, "naas": 114
    ]

    private static func normalize(_ s: String) -> String {
        return String(s.lowercased().unicodeScalars.filter {
            ($0 >= "a" && $0 <= "z") || ($0 >= "0" && $0 <= "9")
        })
    }

    private static let arabicArticles: Set<String> = [
        "al", "an", "ar", "as", "ad", "at", "az", "ash", "adh"
    ]

    static let lookup: [String: Int] = {
        var map: [String: Int] = [:]
        func add(_ key: String, _ id: Int) {
            let k = normalize(key)
            if !k.isEmpty && map[k] == nil { map[k] = id }
        }
        for (i, t) in transliterations.enumerated() {
            let id = i + 1
            add(t, id)
            let parts = t.split(separator: "-")
            if parts.count > 1, arabicArticles.contains(parts[0].lowercased()) {
                add(parts.dropFirst().joined(), id)
            }
        }
        for (i, t) in translations.enumerated() {
            let id = i + 1
            add(t, id)
            let lower = t.lowercased()
            if lower.hasPrefix("the ") {
                add(String(t.dropFirst(4)), id)
            }
        }
        for (key, id) in aliases { add(key, id) }
        return map
    }()

    private static func firstInt(in s: String) -> Int? {
        var digits = ""
        var found: Int? = nil
        for ch in s {
            if ch.isNumber {
                digits.append(ch)
            } else if !digits.isEmpty {
                found = Int(digits)
                break
            }
        }
        if found == nil, !digits.isEmpty { found = Int(digits) }
        return found
    }

    @objc static func resolve(_ raw: String) -> Int {
        let lower = raw.lowercased()
        if let n = firstInt(in: lower), n >= 1 && n <= 114 {
            return n
        }
        var s = normalize(lower)
        let fillers = ["surah", "soorah", "sura", "chapter", "quran", "the", "read", "recite", "play"]
        var changed = true
        while changed {
            changed = false
            for f in fillers where s.hasPrefix(f) && s.count > f.count {
                s = String(s.dropFirst(f.count))
                changed = true
            }
        }
        if let id = lookup[s] { return id }
        for a in arabicArticles where s.hasPrefix(a) {
            if let id = lookup[String(s.dropFirst(a.count))] { return id }
        }
        return 0
    }

    static func displayName(for id: Int) -> String {
        guard id >= 1 && id <= transliterations.count else { return "Surah \(id)" }
        return transliterations[id - 1]
    }
}

struct ReciteSurahError: Error, CustomLocalizedStringResourceConvertible {
    let query: String
    var localizedStringResource: LocalizedStringResource {
        "Sorry, I couldn't find a surah matching \"\(query)\". Try the name or number, like Yaseen or 36."
    }
}

struct ReciteSurahIntent: AppIntent {
    static var title: LocalizedStringResource = "Recite Surah"
    static var description = IntentDescription("Play the recitation of a surah in PEACE2074, hands-free.")
    static var openAppWhenRun: Bool = true

    @Parameter(
        title: "Surah",
        description: "The surah name or number, e.g. Yaseen, Al-Mulk, or 36.",
        requestValueDialog: "Which surah would you like to recite?"
    )
    var surah: String

    static var parameterSummary: some ParameterSummary {
        Summary("Recite \(\.$surah)")
    }

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let id = SurahResolver.resolve(surah)
        guard id >= 1 && id <= 114 else {
            throw ReciteSurahError(query: surah)
        }

        let urlString = "peace2074://quran/\(id)?autoplay=true"
        let defaults = UserDefaults.standard
        defaults.set(urlString, forKey: SurahResolver.pendingDeepLinkKey)

        NotificationCenter.default.post(
            name: SurahResolver.reciteNotification,
            object: nil,
            userInfo: ["url": urlString]
        )

        let name = SurahResolver.displayName(for: id)
        return .result(dialog: "Playing Surah \(name) in PEACE2074.")
    }
}

struct Peace2074Shortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: ReciteSurahIntent(),
            phrases: [
                "Recite a surah in \(.applicationName)",
                "Recite Surah in \(.applicationName)",
                "Recite Quran in \(.applicationName)",
                "Play a surah in \(.applicationName)",
                "Play Surah in \(.applicationName)",
                "Read a surah in \(.applicationName)",
                "Read Surah in \(.applicationName)"
            ],
            shortTitle: "Recite Surah",
            systemImageName: "play.circle"
        )
    }
}
