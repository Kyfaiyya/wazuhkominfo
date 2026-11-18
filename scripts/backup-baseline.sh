#!/bin/bash
# =============================================================================
# backup-baseline.sh — Backup kondisi awal database dan storage
#
# Penggunaan:
#   bash scripts/backup-baseline.sh
#
# Output:
#   ./baseline/<YYYYMMDD_HHMMSS>/
#   ├── database.sql         # PostgreSQL dump
#   ├── minio-data/           # Copy isi bucket MinIO
#   └── metadata.txt          # Info backup (timestamp, git hash, dll)
#
# Jalankan SEBELUM memulai sesi pengujian keamanan,
# supaya bisa di-restore ke kondisi awal setelah pengujian selesai.
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Konfigurasi (bisa di-override via environment variable)
# ---------------------------------------------------------------------------
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-webkominfo-kp-postgres}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-webkominfo}"
MINIO_CONTAINER="${MINIO_CONTAINER:-webkominfo-kp-minio}"
MINIO_BUCKET="${MINIO_BUCKET:-webkominfo}"

# ---------------------------------------------------------------------------
# Timestamp & folder backup
# ---------------------------------------------------------------------------
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/baseline/${TIMESTAMP}"

echo "=========================================="
echo "🗄️  Backup Baseline — webkominfo"
echo "=========================================="
echo "Timestamp : ${TIMESTAMP}"
echo "Backup dir: ${BACKUP_DIR}"
echo ""

mkdir -p "${BACKUP_DIR}"

# ---------------------------------------------------------------------------
# 1. Dump PostgreSQL
# ---------------------------------------------------------------------------
echo "📦 [1/3] Dumping PostgreSQL database '${POSTGRES_DB}'..."

if docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
    docker exec "${POSTGRES_CONTAINER}" \
        pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
        --clean --if-exists --no-owner \
        > "${BACKUP_DIR}/database.sql"
    
    DUMP_SIZE=$(du -sh "${BACKUP_DIR}/database.sql" | cut -f1)
    echo "   ✅ Database dump berhasil (${DUMP_SIZE})"
else
    echo "   ❌ Container '${POSTGRES_CONTAINER}' tidak berjalan!"
    echo "   Jalankan 'docker compose up -d' terlebih dahulu."
    exit 1
fi

# ---------------------------------------------------------------------------
# 2. Backup MinIO bucket data
# ---------------------------------------------------------------------------
echo "📦 [2/3] Backing up MinIO bucket '${MINIO_BUCKET}'..."

MINIO_BACKUP_DIR="${BACKUP_DIR}/minio-data"
mkdir -p "${MINIO_BACKUP_DIR}"

if docker ps --format '{{.Names}}' | grep -q "^${MINIO_CONTAINER}$"; then
    # Gunakan docker cp untuk menyalin data bucket dari container
    # MinIO menyimpan data di /data/<bucket-name>/
    docker cp "${MINIO_CONTAINER}:/data/${MINIO_BUCKET}/." "${MINIO_BACKUP_DIR}/" 2>/dev/null || true
    
    FILE_COUNT=$(find "${MINIO_BACKUP_DIR}" -type f 2>/dev/null | wc -l)
    TOTAL_SIZE=$(du -sh "${MINIO_BACKUP_DIR}" 2>/dev/null | cut -f1)
    echo "   ✅ MinIO backup berhasil (${FILE_COUNT} file, ${TOTAL_SIZE})"
else
    echo "   ⚠️  Container '${MINIO_CONTAINER}' tidak berjalan."
    echo "   MinIO backup dilewati."
fi

# ---------------------------------------------------------------------------
# 3. Simpan metadata
# ---------------------------------------------------------------------------
echo "📦 [3/3] Menyimpan metadata..."

GIT_HASH=$(git -C "${PROJECT_ROOT}" rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git -C "${PROJECT_ROOT}" branch --show-current 2>/dev/null || echo "unknown")

cat > "${BACKUP_DIR}/metadata.txt" << EOF
===========================================
Baseline Backup Metadata
===========================================
Timestamp    : ${TIMESTAMP}
Date         : $(date '+%Y-%m-%d %H:%M:%S %Z')
Git Commit   : ${GIT_HASH}
Git Branch   : ${GIT_BRANCH}
DB Container : ${POSTGRES_CONTAINER}
DB Name      : ${POSTGRES_DB}
MinIO Bucket : ${MINIO_BUCKET}
===========================================
EOF

echo "   ✅ Metadata tersimpan"

# ---------------------------------------------------------------------------
# Selesai
# ---------------------------------------------------------------------------
echo ""
echo "=========================================="
echo "✅ Backup baseline selesai!"
echo "   Lokasi: ${BACKUP_DIR}"
echo ""
echo "   Untuk restore, jalankan:"
echo "   bash scripts/restore-baseline.sh ${TIMESTAMP}"
echo "=========================================="
