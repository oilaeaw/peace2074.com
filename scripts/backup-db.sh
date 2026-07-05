#!/usr/bin/env bash
# Backup / restore local MongoDB (or migrate from a legacy remote dump)
# Usage:
#   ./scripts/backup-db.sh            # dump Atlas → local
#   ./scripts/backup-db.sh --restore  # restore latest dump into local Mongo
#
# Requires: mongodump / mongorestore (MongoDB Database Tools)
#   brew install mongodb-database-tools

set -euo pipefail

DUMP_DIR="$HOME/.peace2074-backup"
DB_NAME="peace2074"
LOCAL_URI="mongodb://localhost:27017/${DB_NAME}"

# Load DATABASE_URL from .env if not already in environment
if [ -z "${DATABASE_URL:-}" ] && [ -f ".env" ]; then
  export DATABASE_URL=$(grep '^DATABASE_URL=' .env | cut -d '=' -f2- | tr -d '"')
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL not set. Export it or add it to .env"
  exit 1
fi

mkdir -p "$DUMP_DIR"

if [[ "${1:-}" == "--restore" ]]; then
  echo "🔄 Restoring latest dump into local MongoDB at ${LOCAL_URI}..."
  mongorestore \
    --uri="$LOCAL_URI" \
    --drop \
    --dir="$DUMP_DIR/latest" \
    --quiet
  echo "✅ Restore complete. Local MongoDB is up to date."
else
  echo "📦 Dumping ${DATABASE_URL} → ${DUMP_DIR}/latest ..."
  mongodump \
    --uri="$DATABASE_URL" \
    --out="$DUMP_DIR/latest" \
    --quiet
  # Keep a timestamped copy as well
  STAMP=$(date +%Y%m%d_%H%M%S)
  cp -r "$DUMP_DIR/latest" "$DUMP_DIR/${STAMP}"
  echo "✅ Dump complete → ${DUMP_DIR}/latest  (archive: ${STAMP})"
  echo ""
  echo "To restore into local MongoDB run:"
  echo "  ./scripts/backup-db.sh --restore"
fi
