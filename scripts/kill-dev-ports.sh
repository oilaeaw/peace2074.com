#!/bin/bash

# Kill processes on ports 4000 and 3000
echo "🔍 Checking for processes on ports 4000 and 3000..."

for port in 4000 3000; do
  PID=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$PID" ]; then
    echo "⚡ Killing process $PID on port $port"
    kill -9 $PID 2>/dev/null
  fi
done

# Wait for ports to be free
sleep 1

# Verify ports are free
for port in 4000 3000; do
  if lsof -i:$port >/dev/null 2>&1; then
    echo "⚠️  Port $port still occupied, forcing cleanup..."
    lsof -ti:$port | xargs kill -9 2>/dev/null
  fi
done

echo "✅ Ports ready"
