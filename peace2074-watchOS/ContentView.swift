#if os(watchOS)
import SwiftUI
import WatchKit
struct ContentView: View {
    @State private var count = 0
    @State private var isPulsing = false
    
    var body: some View {
        VStack {
            Text("Tasbeeh")
                .font(.headline)
                .foregroundColor(.green)
                .padding(.top)
            
            Spacer()
            
            ZStack {
                Circle()
                    .stroke(Color.green.opacity(0.3), lineWidth: 8)
                    .frame(width: 120, height: 120)
                
                Circle()
                    .trim(from: 0.0, to: CGFloat(count % 33) / 33.0)
                    .stroke(Color.green, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .frame(width: 120, height: 120)
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut, value: count)
                
                Button(action: incrementCounter) {
                    Text("\(count)")
                        .font(.system(size: 40, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                }
                .buttonStyle(PlainButtonStyle())
                .frame(width: 100, height: 100)
                .background(Color.green.opacity(0.2))
                .clipShape(Circle())
                .scaleEffect(isPulsing ? 1.05 : 1.0)
                .animation(.spring(response: 0.3, dampingFraction: 0.5), value: isPulsing)
            }
            
            Spacer()
            
            Button(action: resetCounter) {
                Image(systemName: "arrow.counterclockwise")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
                    .padding(8)
                    .background(Color.gray.opacity(0.3))
                    .clipShape(Circle())
            }
            .buttonStyle(PlainButtonStyle())
            .padding(.bottom)
        }
        .edgesIgnoringSafeArea(.bottom)
    }
    
    private func incrementCounter() {
        // Haptic feedback for Apple Watch
        WKInterfaceDevice.current().play(.click)
        
        count += 1
        
        // Pulse animation
        isPulsing = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            isPulsing = false
        }
        
        // Special haptic every 33 counts
        if count % 33 == 0 && count > 0 {
            WKInterfaceDevice.current().play(.success)
        }
    }
    
    private func resetCounter() {
        count = 0
        WKInterfaceDevice.current().play(.retry)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
#endif
