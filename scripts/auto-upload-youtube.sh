#!/bin/bash
# Auto YouTube Upload Script — Peace2074
# Runs automatically via macOS LaunchAgent. No manual input needed.

cd /Users/waelio/Code/GitHub/peace2074/peace2074.com

LOG_FILE="$HOME/peace2074-youtube-upload.log"
echo "============================" >> "$LOG_FILE"
echo "Auto-upload started: $(date)" >> "$LOG_FILE"
echo "============================" >> "$LOG_FILE"

node --experimental-strip-types scripts/batch-generate-114-surah-videos.ts 2 114 >> "$LOG_FILE" 2>&1

echo "" >> "$LOG_FILE"
echo "Auto-upload finished: $(date)" >> "$LOG_FILE"
echo "============================" >> "$LOG_FILE"
