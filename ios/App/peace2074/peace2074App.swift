//
//  peace2074App.swift
//  peace2074
//
//  Created by waelio on 01/03/2026.
//

import SwiftUI
import CoreData

@main
struct peace2074App: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
