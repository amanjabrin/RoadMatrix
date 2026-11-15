#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$ROOT_DIR/.running_pids"

echo "=== Stopping RoadMatrix Services ==="

for port in 5173 8080 8081 8083 8084 8085 8086 8087 8089 8888 8761; do
    pids=$(lsof -ti :$port 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "Stopping processes on port $port (PID: $pids)..."
        kill -9 $pids 2>/dev/null
    fi
done

rm -f "$PID_FILE"
echo "=== All Services Stopped ==="
