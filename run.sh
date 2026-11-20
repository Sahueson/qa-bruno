#!/usr/bin/env bash
# Ejecuta suites de la colección de Bruno contra el staging y escribe result.json (formato del lab).
#   SUITE=a-auth[,b-eventos...]  GREP='TC-API01 Anónimo…|TC-API02 …' (opcional)  ./run.sh
# SUITE se limpia a caracteres de slug; de cada nombre de GREP solo se usa el id (TC-APInn) para localizar su .bru.
# Con STG_SECRET_KEY reserva y resetea el staging; sin ella (local) solo lanza las pruebas.
# Sin QA_PASSWORD los casos con login salen "omitidos".
set -euo pipefail
cd "$(dirname "$0")"
ALL="a-auth,b-eventos,c-inscripciones,d-asistencia,e-gobernanza,f-excedencias,g-jugadores,h-calendario,i-normas"
SUITE=$(printf %s "${SUITE:-$ALL}" | tr -cd 'a-z0-9,-')
export SUITE
rm -f bruno-report.json result.json
run() {
  local args=(run --env staging --sandbox developer --reporter-json bruno-report.json)
  [ -n "${QA_PASSWORD:-}" ] && args+=(--env-var "qa_password=$QA_PASSWORD")
  [ -n "${BASE_URL_API:-}" ] && args+=(--env-var "base_url=$BASE_URL_API")
  local targets=()
  if [ -n "${GREP:-}" ]; then
    IFS='|' read -ra names <<< "$GREP"
    for n in "${names[@]}"; do
      n="${n#^}"; n="${n//\\/}"; id=$(printf %s "${n%% *}" | tr -cd 'A-Z0-9-')
      f=$(find api -name "$id.bru" | head -1); [ -n "$f" ] && targets+=("$f")
    done
  else
    IFS=',' read -ra list <<< "$SUITE"
    for s in "${list[@]}"; do [ -d "api/$s" ] && targets+=("api/$s"); done
  fi
  npx bru "${args[@]}" "${targets[@]}" || true
  node to-result.js bruno-report.json result.json
}
if [ -n "${STG_SECRET_KEY:-}" ] && [ -f shared/reset-staging/with-staging.js ]; then
  export -f run; exec node shared/reset-staging/with-staging.js -- bash -c run
else
  run
fi
