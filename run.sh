#!/usr/bin/env bash
# Ejecuta la colección de Bruno contra el staging y escribe result.json (formato del lab).
#   SUITE=api  ./run.sh
# Con STG_SECRET_KEY reserva y resetea el staging; sin ella (local) solo lanza las pruebas.
# Sin QA_PASSWORD los casos con login salen "omitidos".
set -euo pipefail
cd "$(dirname "$0")"
SUITE=$(printf %s "${SUITE:-api}" | tr -cd 'a-z0-9,-')
export SUITE
rm -f bruno-report.json result.json
run() {
  local args=(run api --env staging --sandbox developer --reporter-json bruno-report.json)
  [ -n "${QA_PASSWORD:-}" ] && args+=(--env-var "qa_password=$QA_PASSWORD")
  [ -n "${BASE_URL_API:-}" ] && args+=(--env-var "base_url=$BASE_URL_API")
  npx bru "${args[@]}" || true
  node to-result.js bruno-report.json result.json
}
if [ -n "${STG_SECRET_KEY:-}" ] && [ -f shared/reset-staging/with-staging.js ]; then
  export -f run; exec node shared/reset-staging/with-staging.js -- bash -c run
else
  run
fi
