import SwiftUI

struct SuraListView: View {
    @EnvironmentObject var store: QuranStore

    var body: some View {
        List(bundledSuras) { sura in
            NavigationLink(destination: AyahScrollView(sura: sura)) {
                VStack(alignment: .trailing, spacing: 2) {
                    Text(sura.name)
                        .font(.system(size: 16, weight: .semibold))
                        .frame(maxWidth: .infinity, alignment: .trailing)
                        .environment(\.layoutDirection, .rightToLeft)

                    Text(sura.transliteration)
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }
                .padding(.vertical, 2)
            }
        }
        .listStyle(.carousel)
        .navigationTitle("السور")
    }
}

#Preview {
    NavigationStack {
        SuraListView()
            .environmentObject(QuranStore())
    }
}
