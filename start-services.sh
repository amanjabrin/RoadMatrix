#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$ROOT_DIR/logs"
PID_FILE="$ROOT_DIR/.running_pids"

mkdir -p "$LOGS_DIR"

export JAVA_HOME=/opt/homebrew/opt/openjdk
export PATH=$JAVA_HOME/bin:/opt/homebrew/bin:$PATH

echo "=== Starting RoadMatrix Services ==="

start_service() {
    local name="$1"
    local jar="$2"
    local port="$3"
    local log="$LOGS_DIR/${name}.log"

    if lsof -i :$port >/dev/null 2>&1; then
        echo "[ALREADY RUNNING] $name on port $port"
    else
        echo "[STARTING] $name on port $port..."
        nohup java -Xmx256m -jar "$jar" > "$log" 2>&1 &
        local pid=$!
        echo "$pid:$name:$port" >> "$PID_FILE"
        echo "[STARTED] $name (PID: $pid)"
    fi
}

# 1. Eureka Server (8761)
start_service "service-registry" "$ROOT_DIR/backend/service-registry/target/service-registry-0.0.1-SNAPSHOT.jar" 8761

# Wait for Eureka
echo "Waiting for Eureka Server (8761)..."
for i in {1..20}; do
    if curl -s http://localhost:8761/ >/dev/null 2>&1; then
        echo "Eureka Server is UP!"
        break
    fi
    sleep 1
done

# 2. Config Server (8888)
start_service "config-server" "$ROOT_DIR/backend/config-server/target/config-server-0.0.1-SNAPSHOT.jar" 8888

# Wait for Config Server
echo "Waiting for Config Server (8888)..."
for i in {1..20}; do
    if curl -s http://localhost:8888/application/default >/dev/null 2>&1; then
        echo "Config Server is UP!"
        break
    fi
    sleep 1
done

# 3. Microservices
start_service "auth-service" "$ROOT_DIR/backend/auth_service/target/auth-service-0.0.1-SNAPSHOT.jar" 8081
start_service "fleet-service" "$ROOT_DIR/backend/fleet-service/target/fleet-service-0.0.1-SNAPSHOT.jar" 8083
start_service "driver-service" "$ROOT_DIR/backend/driver-service/target/driver-service-0.0.1-SNAPSHOT.jar" 8084
start_service "trip-service" "$ROOT_DIR/backend/trip-service/target/trip-service-0.0.1-SNAPSHOT.jar" 8085
start_service "maintenance-service" "$ROOT_DIR/backend/maintenance-service/target/maintenance-service-0.0.1-SNAPSHOT.jar" 8086
start_service "expense-service" "$ROOT_DIR/backend/expense-service/target/expense-service-0.0.1-SNAPSHOT.jar" 8087
start_service "report-service" "$ROOT_DIR/backend/report-service/target/report-service-0.0.1-SNAPSHOT.jar" 8089

# Wait 6s for services to begin registering
sleep 6

# 4. API Gateway (8080)
start_service "api-gateway" "$ROOT_DIR/backend/api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar" 8080

# 5. Frontend (5173)
if lsof -i :5173 >/dev/null 2>&1; then
    echo "[ALREADY RUNNING] Frontend on port 5173"
else
    echo "[STARTING] Frontend on port 5173..."
    (cd "$ROOT_DIR/app" && nohup npm run dev > "$LOGS_DIR/frontend.log" 2>&1 &)
    echo "[STARTED] Frontend on port 5173"
fi

echo "=== All RoadMatrix Services Started Successfully ==="
