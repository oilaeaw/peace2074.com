import SwiftUI

/// Displays all ayahs of a sura in a vertically-scrolling list.
/// The Digital Crown scrolls naturally through them.
struct AyahScrollView: View {
    let sura: Sura
    @EnvironmentObject var store: QuranStore
    @State private var scrollTarget: String?

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 10) {
                    // Sura header
                    VStack(spacing: 2) {
                        Text(sura.name)
                            .font(.system(size: 15, weight: .bold))
                            .frame(maxWidth: .infinity, alignment: .trailing)
                            .environment(\.layoutDirection, .rightToLeft)

                        Text(sura.transliteration)
                            .font(.system(size: 10))
                            .foregroundStyle(.secondary)

                        Divider().padding(.top, 4)
                    }

                    ForEach(sura.ayahs) { ayah in
                        AyahRow(ayah: ayah)
                            .id(ayah.id)
                    }
                }
                .padding(.horizontal, 4)
            }
            .onAppear {
                // If the store's current sura matches, jump to current ayah
                if store.selectedSura.id == sura.id {
                    let target = sura.ayahs[min(store.selectedAyahIndex, sura.ayahs.count - 1)].id
                    proxy.scrollTo(target, anchor: .top)
                }
            }
        }
        .navigationTitle(sura.transliteration)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            store.select(sura: sura)
        }
    }
}

// MARK: - Single ayah row

struct AyahRow: View {
    let ayah: Ayah

    var body: some View {
        VStack(alignment: .trailing, spacing: 4) {
            Text(ayah.text)
                .font(.system(size: 14, weight: .regular))
                .multilineTextAlignment(.trailing)
                .frame(maxWidth: .infinity, alignment: .trailing)
                .environment(\.layoutDirection, .rightToLeft)
                .lineSpacing(3)

            Text("\(ayah.verse)")
                .font(.system(size: 10, weight: .light))
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding(8)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.white.opacity(0.06))
        )
    }
}

#Preview {
    NavigationStack {
        AyahScrollView(sura: bundledSuras[0])
            .environmentObject(QuranStore())
    }
}
