#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Create a temporary file to store the server log
LOGFILE=$(mktemp)

# Start the dev server in the background, redirecting its output to the log file
echo "Starting dev server..."
deno task dev &> "$LOGFILE" &
SERVER_PID=$!

# Give the server a moment to start up
echo "Waiting for server to start..."
sleep 8 # Increased wait time to ensure server is ready

# Extract the server URL (including port) from the log file
# This looks for the line "➜ Local:    http://localhost:XXXX/" and extracts the URL
SERVER_URL=$(grep -m 1 -o 'http://localhost:[0-9]\+' "$LOGFILE")

if [ -z "$SERVER_URL" ]; then
  echo "Error: Could not determine server URL from logs."
  echo "--- Server Log ---"
  cat "$LOGFILE"
  echo "--------------------"
  # Clean up before exiting
  kill $SERVER_PID
  rm "$LOGFILE"
  exit 1
fi

echo "Server detected at: $SERVER_URL"

# Run the tests against the dynamically detected server URL
echo "Running E2E tests..."
# The '|| true' ensures the script continues to the cleanup step even if tests fail
deno test --allow-all e2e/ -- --base-url="$SERVER_URL" || true

# Stop the server and clean up
echo "Shutting down server..."
kill $SERVER_PID
rm "$LOGFILE"

echo "Test run complete."
