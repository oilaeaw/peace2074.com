#!/bin/bash

# Kill processes on ports 4000 and 3000
echo "🔍 Checking for processes on ports 4000 and 3000..."

# Kill any lingering node/dev processes first
pkill -9 -f "vite --strictPort" 2>/dev/null
pkill -9 -f "nitro dev" 2>/dev/null
sleep 1

# Kill by port
for port in 4000 3000; do
  PID=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$PID" ]; then
    echo "⚡ Killing process $PID on port $port"
    kill -9 $PID 2>/dev/null
    sleep 0.5
  fi
done

# Wait for ports to be free
sleep 2

# Final verification and force cleanup if needed
for port in 4000 3000; do
  if lsof -i:$port >/dev/null 2>&1; then
    echo "⚠️  Port $port still occupied, forcing cleanup..."
    lsof -ti:$port | xargs kill -9 2>/dev/null
    sleep 1
  else
    echo "✅ Port $port is free"
  fi
done

echo "✅ All ports ready"
