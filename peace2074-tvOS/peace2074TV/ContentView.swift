import SwiftUI

struct AppFeature: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let symbol: String
}

struct ContentView: View {
    private let features: [AppFeature] = [
        AppFeature(
            title: "Read Quran",
            subtitle: "Browse surahs in a calm fullscreen reading experience.",
            symbol: "book.closed.fill"
        ),
        AppFeature(
            title: "Tasbeeh",
            subtitle: "Keep dhikr counts with a focused remote-friendly flow.",
            symbol: "circle.grid.2x2.fill"
        ),
        AppFeature(
            title: "Holy Names",
            subtitle: "Reflect on the 99 Names in a spacious lean-back layout.",
            symbol: "sparkles.rectangle.stack.fill"
        )
    ]

    var body: some View {
        NavigationStack {
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

                VStack(alignment: .leading, spacing: 36) {
                    hero

                    ScrollView(.horizontal) {
                        HStack(spacing: 28) {
                            ForEach(features) { feature in
                                FeatureCard(feature: feature)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                    .scrollIndicators(.hidden)

                    Spacer(minLength: 0)
                }
                .padding(.horizontal, 72)
                .padding(.vertical, 56)
            }
            .navigationTitle("PEACE2074")
        }
    }

    private var hero: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("PEACE2074")
                .font(.system(size: 58, weight: .bold, design: .rounded))

            Text("Quran recitation, Tasbeeh, and Holy Names designed for a calm Apple TV experience.")
                .font(.system(size: 24, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.85))
                .frame(maxWidth: 900, alignment: .leading)

            HStack(spacing: 14) {
                Label("Native SwiftUI tvOS app", systemImage: "tv.fill")
                Label("Shared PEACE2074 product", systemImage: "heart.text.square.fill")
            }
            .font(.system(size: 18, weight: .semibold, design: .rounded))
            .foregroundStyle(.white.opacity(0.72))
        }
        .foregroundStyle(.white)
    }
}

private struct FeatureCard: View {
    let feature: AppFeature
    @Environment(\.isFocused) private var isFocused

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Image(systemName: feature.symbol)
                .font(.system(size: 34, weight: .bold))
                .foregroundStyle(Color(red: 0.61, green: 0.89, blue: 0.51))

            Text(feature.title)
                .font(.system(size: 30, weight: .bold, design: .rounded))
                .foregroundStyle(.white)

            Text(feature.subtitle)
                .font(.system(size: 20, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.8))
                .fixedSize(horizontal: false, vertical: true)

            Spacer(minLength: 0)
        }
        .padding(28)
        .frame(width: 420, height: 260, alignment: .topLeading)
        .background(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(Color.white.opacity(isFocused ? 0.18 : 0.1))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(Color.white.opacity(isFocused ? 0.35 : 0.14), lineWidth: 1.5)
        )
        .scaleEffect(isFocused ? 1.04 : 1.0)
        .animation(.easeOut(duration: 0.18), value: isFocused)
    }
}

#Preview {
    ContentView()
}
