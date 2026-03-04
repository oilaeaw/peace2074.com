#!/bin/bash
# iOS Development Helper Script
# Usage: ./scripts/ios-dev.sh [command]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

check_dev_server() {
    if ! curl -s http://localhost:4000 > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Dev server not running on http://localhost:4000${NC}"
        echo -e "${YELLOW}   Start it with: pnpm dev${NC}\n"
        return 1
    else
        echo -e "${GREEN}✓ Dev server running on http://localhost:4000${NC}\n"
        return 0
    fi
}

dev_mode() {
    print_header "🔧 iOS Development Mode (Live Reload)"
    
    # Check if dev server is running
    check_dev_server || {
        echo "Starting dev servers..."
        pnpm dev &
        DEV_PID=$!
        echo "Dev server PID: $DEV_PID"
        sleep 5
    }
    
    # Sync without building
    echo "Syncing to iOS..."
    npx cap sync ios
    
    echo -e "\n${GREEN}✓ Ready for development${NC}"
    echo -e "Opening Xcode...\n"
    npx cap open ios
}

build_mode() {
    print_header "📦 iOS Production Build"
    
    echo "Building Vue app..."
    pnpm build
    
    echo "Syncing to iOS..."
    npx cap sync ios
    
    echo -e "\n${GREEN}✓ Build complete${NC}"
    echo -e "Opening Xcode...\n"
    npx cap open ios
}

sync_only() {
    print_header "🔄 Sync to iOS"
    
    npx cap sync ios
    echo -e "\n${GREEN}✓ Sync complete${NC}\n"
}

open_xcode() {
    print_header "📱 Opening Xcode"
    
    open ios/App/App.xcworkspace
}

clean_build() {
    print_header "🧹 Clean iOS Build"
    
    echo "Cleaning Xcode DerivedData..."
    rm -rf ~/Library/Developer/Xcode/DerivedData/*
    
    echo "Cleaning dist..."
    rm -rf dist
    
    echo "Reinstalling iOS Pods..."
    cd ios/App
    pod deintegrate || true
    pod install
    cd "$PROJECT_ROOT"
    
    echo -e "\n${GREEN}✓ Clean complete${NC}\n"
}

update_pods() {
    print_header "📦 Update CocoaPods"
    
    cd ios/App
    pod update
    cd "$PROJECT_ROOT"
    
    echo -e "\n${GREEN}✓ Pods updated${NC}\n"
}

show_info() {
    print_header "ℹ️  iOS Project Info"
    
    cd ios/App
    echo "Targets:"
    xcodebuild -list | grep -A5 "Targets:" | tail -n +2
    
    echo -e "\nSchemes:"
    xcodebuild -list | grep -A5 "Schemes:" | tail -n +2
    
    echo -e "\nCapacitor Version:"
    npx cap --version
    
    echo -e "\nInstalled Pods:"
    if [ -f "Podfile.lock" ]; then
        cat Podfile.lock | grep "^  - " | head -10
    else
        echo "No Podfile.lock found"
    fi
    
    cd "$PROJECT_ROOT"
}

show_usage() {
    cat << EOF
${GREEN}iOS Development Helper${NC}

${BLUE}Usage:${NC}
  ./scripts/ios-dev.sh [command]

${BLUE}Commands:${NC}
  dev         - Development mode (live reload from localhost:4000)
  build       - Production build mode (bundle app)
  sync        - Sync web assets to iOS only
  open        - Open Xcode workspace
  clean       - Clean build artifacts and reinstall pods
  pods        - Update CocoaPods dependencies
  info        - Show iOS project information
  help        - Show this help message

${BLUE}Examples:${NC}
  ${YELLOW}# Development with live reload${NC}
  ./scripts/ios-dev.sh dev

  ${YELLOW}# Build for production testing${NC}
  ./scripts/ios-dev.sh build

  ${YELLOW}# Clean build when things go wrong${NC}
  ./scripts/ios-dev.sh clean

${BLUE}npm scripts:${NC}
  pnpm ios:dev     - Quick dev mode (sync + open)
  pnpm ios:build   - Full build (build + sync + open)
  pnpm ios:sync    - Sync only
  pnpm ios:open    - Open Xcode only

EOF
}

# Main script
case "${1:-help}" in
    dev)
        dev_mode
        ;;
    build)
        build_mode
        ;;
    sync)
        sync_only
        ;;
    open)
        open_xcode
        ;;
    clean)
        clean_build
        ;;
    pods)
        update_pods
        ;;
    info)
        show_info
        ;;
    help|*)
        show_usage
        ;;
esac
