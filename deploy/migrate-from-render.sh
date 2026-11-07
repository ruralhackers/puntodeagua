#!/usr/bin/env bash
# One-shot migration: Render Postgres + R2 images -> this stack.
# Run from the directory holding docker-compose.yml, with the web app on
# Render already stopped so nothing is written after the dump.
#
#   SOURCE_DATABASE_URL='postgresql://...render.com/...' ./migrate-from-render.sh
#
# Images are downloaded from their public URLs (images.puntodeagua.com), so
# no R2 credentials are needed. Run it before switching DNS.
set -euo pipefail

: "${SOURCE_DATABASE_URL:?set SOURCE_DATABASE_URL}"
cd "$(dirname "$0")"
DUMP="data/render-$(date +%Y%m%d-%H%M%S).dump"
mkdir -p data/images

echo "==> Dumping source database to $DUMP"
docker run --rm -v "$PWD/data:/data" postgres:17 \
  pg_dump --format=custom --no-owner --no-privileges \
  --file="/data/$(basename "$DUMP")" "$SOURCE_DATABASE_URL"

echo "==> Restoring into local db (replaces existing objects)"
docker compose up -d db
until docker compose exec -T db pg_isready -U puntodeagua -d puntodeagua >/dev/null 2>&1; do sleep 1; done
docker compose exec -T db pg_restore --clean --if-exists --no-owner --no-privileges \
  -U puntodeagua -d puntodeagua < "$DUMP"

echo "==> Downloading images"
LIST=$(mktemp)
docker compose exec -T db psql -U puntodeagua -d puntodeagua -At -c "
  SELECT url, external_key FROM \"WaterMeterReadingImage\"
  UNION ALL SELECT url, external_key FROM \"WaterMeterImage\"
  UNION ALL SELECT url, external_key FROM \"IncidentImage\";" > "$LIST"

total=0; failed=0
while IFS='|' read -r url key; do
  [ -n "$url" ] || continue
  total=$((total + 1))
  dest="data/images/$key"
  [ -s "$dest" ] && continue
  mkdir -p "$(dirname "$dest")"
  if ! curl -fsSL --retry 3 -o "$dest.part" "$url"; then
    echo "FAILED: $url" >&2; failed=$((failed + 1)); rm -f "$dest.part"; continue
  fi
  mv "$dest.part" "$dest"
done < "$LIST"
rm -f "$LIST"

echo "==> Images: $total referenced, $failed failed"
echo "==> Row counts"
docker compose exec -T db psql -U puntodeagua -d puntodeagua -c "
  SELECT 'users' t, count(*) FROM \"User\"
  UNION ALL SELECT 'communities', count(*) FROM \"Community\"
  UNION ALL SELECT 'readings', count(*) FROM \"WaterMeterReading\";"
[ "$failed" -eq 0 ]
