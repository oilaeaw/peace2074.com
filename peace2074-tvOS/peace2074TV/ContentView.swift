import SwiftUI

enum PeaceRoute: String, Hashable, CaseIterable {
    case quran
    case tasbeeh
    case names
}

struct AppFeature: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let symbol: String
    let route: PeaceRoute
}

struct ContentView: View {
    @State private var navigationPath = NavigationPath()

    private let features: [AppFeature] = [
        AppFeature(
            title: "Read Quran",
            subtitle: "Browse surahs in a calm fullscreen reading experience.",
            symbol: "book.closed.fill",
            route: .quran
        ),
        AppFeature(
            title: "Tasbeeh",
            subtitle: "Keep dhikr counts with a focused remote-friendly flow.",
            symbol: "circle.grid.2x2.fill",
            route: .tasbeeh
        ),
        AppFeature(
            title: "Holy Names",
            subtitle: "Reflect on the 99 Names in a spacious lean-back layout.",
            symbol: "sparkles.rectangle.stack.fill",
            route: .names
        )
    ]

    var body: some View {
        NavigationStack(path: $navigationPath) {
            ZStack {
                LinearGradient(
                    colors: [
                        Color(red: 0.05, green: 0.11, blue: 0.09),
                        Color(red: 0.08, green: 0.21, blue: 0.16),
                        Color.black
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                VStack(alignment: .leading, spacing: 48) {
                    hero

                    HStack(spacing: 36) {
                        ForEach(features) { feature in
                            NavigationLink(value: feature.route) {
                                FeatureCard(feature: feature)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }

                    Spacer(minLength: 0)
                }
                .padding(.horizontal, 72)
                .padding(.vertical, 56)
            }
            .navigationTitle("PEACE2074")
            .navigationDestination(for: PeaceRoute.self) { route in
                switch route {
                case .quran:
                    QuranView()
                case .tasbeeh:
                    TasbeehView()
                case .names:
                    HolyNamesView()
                }
            }
            .onOpenURL { url in
                handleDeepLink(url)
            }
            .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("OpenPeaceRoute"))) { notification in
                if let routeStr = notification.object as? String,
                   let route = PeaceRoute(rawValue: routeStr) {
                    navigateToRoute(route)
                }
            }
        }
    }

    private var hero: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("PEACE2074")
                .font(.system(size: 64, weight: .bold, design: .rounded))
                .foregroundStyle(
                    LinearGradient(
                        colors: [Color(red: 0.74, green: 0.95, blue: 0.62), .white],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )

            Text("Quran recitation, Tasbeeh, and Holy Names designed for a calm Apple TV experience.")
                .font(.system(size: 26, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.85))
                .frame(maxWidth: 1000, alignment: .leading)

            HStack(spacing: 20) {
                Label("Siri Enabled", systemImage: "waveform.and.mic")
                    .foregroundStyle(Color(red: 0.61, green: 0.89, blue: 0.51))
                Label("Native tvOS", systemImage: "tv.fill")
            }
            .font(.system(size: 20, weight: .semibold, design: .rounded))
            .foregroundStyle(.white.opacity(0.72))
        }
        .foregroundStyle(.white)
    }

    private func handleDeepLink(_ url: URL) {
        guard url.scheme == "peace2074tvos" else { return }
        let host = url.host ?? ""
        if let route = PeaceRoute(rawValue: host) {
            navigateToRoute(route)
        }
    }

    private func navigateToRoute(_ route: PeaceRoute) {
        // Clear existing path and navigate to the requested route
        navigationPath = NavigationPath()
        navigationPath.append(route)
    }
}

private struct FeatureCard: View {
    let feature: AppFeature
    @Environment(\.isFocused) private var isFocused

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Image(systemName: feature.symbol)
                .font(.system(size: 38, weight: .bold))
                .foregroundStyle(Color(red: 0.61, green: 0.89, blue: 0.51))

            Text(feature.title)
                .font(.system(size: 32, weight: .bold, design: .rounded))
                .foregroundStyle(.white)

            Text(feature.subtitle)
                .font(.system(size: 20, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.8))
                .fixedSize(horizontal: false, vertical: true)

            Spacer(minLength: 0)
        }
        .padding(32)
        .frame(width: 440, height: 280, alignment: .topLeading)
        .background(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(Color.white.opacity(isFocused ? 0.22 : 0.08))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(Color.white.opacity(isFocused ? 0.45 : 0.12), lineWidth: 2)
        )
        .scaleEffect(isFocused ? 1.04 : 1.0)
        .animation(.easeOut(duration: 0.18), value: isFocused)
    }
}

// MARK: - Subviews

struct QuranView: View {
    let surahs = [
        ("1", "Al-Fatihah", "The Opening", "7 Verses"),
        ("36", "Yaseen", "Ya Sin", "83 Verses"),
        ("67", "Al-Mulk", "The Sovereignty", "30 Verses"),
        ("78", "An-Naba", "The Tidings", "40 Verses"),
        ("114", "An-Nas", "Mankind", "6 Verses")
    ]

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.04, green: 0.10, blue: 0.07), .black],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 30) {
                Text("Quran Explorer")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .foregroundStyle(Color(red: 0.74, green: 0.95, blue: 0.62))

                ScrollView {
                    VStack(spacing: 20) {
                        ForEach(surahs, id: \.0) { id, name, translation, verses in
                            HStack {
                                Text(id)
                                    .font(.system(size: 28, weight: .bold, design: .rounded))
                                    .frame(width: 60, alignment: .leading)
                                    .foregroundStyle(Color(red: 0.61, green: 0.89, blue: 0.51))

                                VStack(alignment: .leading, spacing: 4) {
                                    Text(name)
                                        .font(.system(size: 28, weight: .bold, design: .rounded))
                                    Text(translation)
                                        .font(.system(size: 20, weight: .medium))
                                        .foregroundStyle(.white.opacity(0.6))
                                }

                                Spacer()

                                Text(verses)
                                    .font(.system(size: 20, weight: .semibold, design: .rounded))
                                    .foregroundStyle(.white.opacity(0.8))
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 8)
                                    .background(Capsule().fill(.white.opacity(0.1)))
                            }
                            .padding(24)
                            .background(RoundedRectangle(cornerRadius: 16).fill(.white.opacity(0.05)))
                        }
                    }
                    .padding(.vertical, 10)
                }
            }
            .padding(.horizontal, 80)
            .padding(.vertical, 40)
        }
        .foregroundStyle(.white)
    }
}

struct TasbeehView: View {
    @State private var count = 0
    @State private var cycle = 1

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.05, green: 0.08, blue: 0.12), .black],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 40) {
                Text("Tasbeeh Counter")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .foregroundStyle(Color(red: 0.61, green: 0.89, blue: 0.51))

                HStack(spacing: 80) {
                    VStack(spacing: 20) {
                        Button(action: {
                            count += 1
                            if count >= 33 {
                                count = 0
                                cycle += 1
                            }
                        }) {
                            ZStack {
                                Circle()
                                    .stroke(.white.opacity(0.1), lineWidth: 8)
                                    .frame(width: 240, height: 240)

                                Circle()
                                    .trim(from: 0, to: CGFloat(count) / 33.0)
                                    .stroke(
                                        LinearGradient(
                                            colors: [Color(red: 0.61, green: 0.89, blue: 0.51), Color(red: 0.74, green: 0.95, blue: 0.62)],
                                            startPoint: .top,
                                            endPoint: .bottom
                                        ),
                                        style: StrokeStyle(lineWidth: 12, lineCap: .round)
                                    )
                                    .frame(width: 240, height: 240)
                                    .rotationEffect(.degrees(-90))
                                    .animation(.spring(), value: count)

                                VStack(spacing: 8) {
                                    Text("\(count)")
                                        .font(.system(size: 72, weight: .bold, design: .rounded))
                                    Text("/ 33")
                                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                                        .foregroundStyle(.white.opacity(0.5))
                                }
                            }
                        }
                        .buttonStyle(PlainButtonStyle())

                        Text("Press SELECT or Click to Count")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundStyle(.white.opacity(0.5))
                    }

                    VStack(alignment: .leading, spacing: 20) {
                        Text("Cycle: \(cycle)")
                            .font(.system(size: 28, weight: .semibold, design: .rounded))

                        Button("Reset Counter") {
                            count = 0
                            cycle = 1
                        }
                        .font(.system(size: 24, weight: .bold))
                        .foregroundStyle(.red)
                    }
                    .padding(32)
                    .background(RoundedRectangle(cornerRadius: 20).fill(.white.opacity(0.04)))
                }
            }
        }
        .foregroundStyle(.white)
    }
}

struct HolyNamesView: View {
    let names = [
        ("Ar-Rahman", "الرحمن", "The Beneficent"),
        ("Ar-Rahim", "الرحيم", "The Merciful"),
        ("Al-Malik", "الملك", "The King"),
        ("Al-Quddus", "القدوس", "The Most Holy"),
        ("As-Salam", "السلام", "The Giver of Peace")
    ]

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.09, green: 0.05, blue: 0.11), .black],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 30) {
                Text("Holy Names of Allah")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .foregroundStyle(Color(red: 0.74, green: 0.95, blue: 0.62))

                ScrollView {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 24) {
                        ForEach(names, id: \.0) { transliteration, arabic, translation in
                            HStack {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(transliteration)
                                        .font(.system(size: 28, weight: .bold, design: .rounded))
                                        .foregroundStyle(Color(red: 0.61, green: 0.89, blue: 0.51))
                                    Text(translation)
                                        .font(.system(size: 20, weight: .medium))
                                        .foregroundStyle(.white.opacity(0.6))
                                }

                                Spacer()

                                Text(arabic)
                                    .font(.system(size: 40, weight: .bold, design: .serif))
                            }
                            .padding(28)
                            .background(RoundedRectangle(cornerRadius: 20).fill(.white.opacity(0.04)))
                        }
                    }
                    .padding(.vertical, 10)
                }
            }
            .padding(.horizontal, 80)
            .padding(.vertical, 40)
        }
        .foregroundStyle(.white)
    }
}
