#!/bin/bash
# =============================================================================
# restore-baseline.sh — Restore database dan storage dari backup baseline
#
# Penggunaan:
#   bash scripts/restore-baseline.sh               # restore dari backup terbaru
#   bash scripts/restore-baseline.sh 20260720_1200  # restore dari timestamp spesifik
#
# ⚠️  PERINGATAN: Script ini akan MENIMPA data database dan storage saat ini!
#     Pastikan Anda yakin sebelum menjalankan.
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Konfigurasi
# ---------------------------------------------------------------------------
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-webkominfo-kp-postgres}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-webkominfo}"
MINIO_CONTAINER="${MINIO_CONTAINER:-webkominfo-kp-minio}"
MINIO_BUCKET="${MINIO_BUCKET:-webkominfo}"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASELINE_ROOT="${PROJECT_ROOT}/baseline"

# ---------------------------------------------------------------------------
# Tentukan folder backup yang akan di-restore
# ---------------------------------------------------------------------------
if [ -n "${1:-}" ]; then
    # Timestamp spesifik diberikan sebagai argument
    BACKUP_DIR="${BASELINE_ROOT}/${1}"
    if [ ! -d "${BACKUP_DIR}" ]; then
        echo "❌ Backup '${1}' tidak ditemukan di ${BASELINE_ROOT}/"
        echo ""
        echo "Backup yang tersedia:"
        ls -1 "${BASELINE_ROOT}/" 2>/dev/null || echo "   (tidak ada backup)"
        exit 1
    fi
else
    # Gunakan backup terbaru
    LATEST=$(ls -1 "${BASELINE_ROOT}/" 2>/dev/null | sort -r | head -n1)
    if [ -z "${LATEST}" ]; then
        echo "❌ Tidak ada backup ditemukan di ${BASELINE_ROOT}/"
        echo "   Jalankan 'bash scripts/backup-baseline.sh' terlebih dahulu."
        exit 1
    fi
    BACKUP_DIR="${BASELINE_ROOT}/${LATEST}"
fi

echo "=========================================="
echo "🔄 Restore Baseline — webkominfo"
echo "=========================================="
echo "Backup dir: ${BACKUP_DIR}"
echo ""

# Tampilkan metadata jika ada
if [ -f "${BACKUP_DIR}/metadata.txt" ]; then
    echo "📋 Metadata backup:"
    cat "${BACKUP_DIR}/metadata.txt"
    echo ""
fi

# ---------------------------------------------------------------------------
# Konfirmasi
# ---------------------------------------------------------------------------
echo "⚠️  PERINGATAN: Proses ini akan MENIMPA data saat ini!"
read -p "Lanjutkan restore? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore dibatalkan."
    exit 0
fi

# ---------------------------------------------------------------------------
# 1. Restore PostgreSQL
# ---------------------------------------------------------------------------
echo ""
echo "📦 [1/2] Restoring PostgreSQL database '${POSTGRES_DB}'..."

if [ -f "${BACKUP_DIR}/database.sql" ]; then
    if docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
        # Drop dan recreate database, lalu restore
        docker exec -i "${POSTGRES_CONTAINER}" \
            psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
            < "${BACKUP_DIR}/database.sql"
        
        echo "   ✅ Database restore berhasil"
    else
        echo "   ❌ Container '${POSTGRES_CONTAINER}' tidak berjalan!"
        echo "   Jalankan 'docker compose up -d' terlebih dahulu."
        exit 1
    fi
else
    echo "   ⚠️  File database.sql tidak ditemukan di backup. Dilewati."
fi

# ---------------------------------------------------------------------------
# 2. Restore MinIO bucket data
# ---------------------------------------------------------------------------
echo "📦 [2/2] Restoring MinIO bucket '${MINIO_BUCKET}'..."

MINIO_BACKUP_DIR="${BACKUP_DIR}/minio-data"

if [ -d "${MINIO_BACKUP_DIR}" ]; then
    if docker ps --format '{{.Names}}' | grep -q "^${MINIO_CONTAINER}$"; then
        # Hapus isi bucket lama, lalu copy data dari backup
        docker exec "${MINIO_CONTAINER}" sh -c "rm -rf /data/${MINIO_BUCKET}/*" 2>/dev/null || true
        docker cp "${MINIO_BACKUP_DIR}/." "${MINIO_CONTAINER}:/data/${MINIO_BUCKET}/"
        
        FILE_COUNT=$(find "${MINIO_BACKUP_DIR}" -type f 2>/dev/null | wc -l)
        echo "   ✅ MinIO restore berhasil (${FILE_COUNT} file)"
    else
        echo "   ⚠️  Container '${MINIO_CONTAINER}' tidak berjalan. MinIO restore dilewati."
    fi
else
    echo "   ⚠️  Folder minio-data tidak ditemukan di backup. Dilewati."
fi

# ---------------------------------------------------------------------------
# 3. Restart web service (supaya cache/koneksi DB di-refresh)
# ---------------------------------------------------------------------------
echo ""
echo "🔄 Restarting web service..."
docker restart webkominfo-app 2>/dev/null || echo "   ⚠️  webkominfo-app tidak berjalan"

# ---------------------------------------------------------------------------
# Selesai
# ---------------------------------------------------------------------------
echo ""
echo "=========================================="
echo "✅ Restore baseline selesai!"
echo "   Data telah dikembalikan ke kondisi baseline."
echo "   Silakan cek aplikasi di http://localhost"
echo "=========================================="
