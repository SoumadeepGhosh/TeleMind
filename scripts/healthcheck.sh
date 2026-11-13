#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# TeleMind Services Healthcheck
# ==============================================================================

API_PORT="${PORT:-3000}"
HEALTH_URL="http://localhost:${API_PORT}/api/v1/health"

echo "🔍 Probing TeleMind API at ${HEALTH_URL}..."

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_URL}" || echo "000")

if [ "$STATUS" -eq 200 ]; then
  echo "✅ TeleMind API is healthy (HTTP 200)"
  exit 0
else
  echo "❌ TeleMind API check failed with HTTP status: $STATUS"
  exit 1
fi
