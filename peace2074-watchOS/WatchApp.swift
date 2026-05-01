//
//  WatchApp.swift
//  Watch
//
//  Created by waelio on 01/05/2026.
//  Copyright © 2026 NativeScript. All rights reserved.
//

#if os(watchOS)
import SwiftUI
import CoreData

@main
struct WatchApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
#endif
