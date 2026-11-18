#!/bin/bash
# =============================================================================
# setup-wazuh.sh — Setup Wazuh single-node deployment
#
# Script ini:
# 1. Clone repo wazuh-docker (versi stabil)
# 2. Copy konfigurasi single-node ke folder ./wazuh/
# 3. Generate sertifikat
# 4. Kustomisasi port dashboard (8443 agar tidak conflict dengan nginx 443)
#
# Penggunaan (jalankan dari root project):
#   bash scripts/setup-wazuh.sh
#
# Prasyarat:
#   - Docker Desktop running
#   - Git installed
#   - Di WSL2: sudo sysctl -w vm.max_map_count=262144
# =============================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WAZUH_DIR="${PROJECT_ROOT}/wazuh"
WAZUH_VERSION="v4.12.0"
TEMP_DIR="${PROJECT_ROOT}/.wazuh-temp"

echo "=========================================="
echo "🛡️  Setup Wazuh Single-Node — webkominfo"
echo "=========================================="
echo "Wazuh Version : ${WAZUH_VERSION}"
echo "Target Dir    : ${WAZUH_DIR}"
echo ""

# ---------------------------------------------------------------------------
# 1. Check prerequisites
# ---------------------------------------------------------------------------
echo "🔍 [1/5] Checking prerequisites..."

if ! command -v docker &>/dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop first."
    exit 1
fi

if ! command -v git &>/dev/null; then
    echo "❌ Git not found. Please install Git first."
    exit 1
fi

# Check vm.max_map_count (important for Wazuh Indexer / OpenSearch)
if command -v sysctl &>/dev/null; then
    CURRENT_MAP_COUNT=$(sysctl -n vm.max_map_count 2>/dev/null || echo "0")
    if [ "${CURRENT_MAP_COUNT}" -lt 262144 ]; then
        echo "⚠️  vm.max_map_count is ${CURRENT_MAP_COUNT} (need >= 262144)"
        echo "   Run: sudo sysctl -w vm.max_map_count=262144"
        echo "   Or add to /etc/sysctl.conf for persistence"
        echo ""
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

echo "   ✅ Prerequisites OK"

# ---------------------------------------------------------------------------
# 2. Clone wazuh-docker repo
# ---------------------------------------------------------------------------
echo "📦 [2/5] Cloning wazuh-docker repo (${WAZUH_VERSION})..."

if [ -d "${TEMP_DIR}" ]; then
    rm -rf "${TEMP_DIR}"
fi

git clone --depth 1 --branch "${WAZUH_VERSION}" \
    https://github.com/wazuh/wazuh-docker.git "${TEMP_DIR}"

echo "   ✅ Clone successful"

# ---------------------------------------------------------------------------
# 3. Copy single-node config to ./wazuh/
# ---------------------------------------------------------------------------
echo "📁 [3/5] Setting up Wazuh directory..."

if [ -d "${WAZUH_DIR}" ]; then
    echo "   ⚠️  ${WAZUH_DIR} already exists."
    read -p "   Overwrite? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   ❌ Setup cancelled."
        rm -rf "${TEMP_DIR}"
        exit 0
    fi
    rm -rf "${WAZUH_DIR}"
fi

# Copy single-node directory
cp -r "${TEMP_DIR}/single-node" "${WAZUH_DIR}"

# Clean up temp
rm -rf "${TEMP_DIR}"

echo "   ✅ Wazuh directory created"

# ---------------------------------------------------------------------------
# 4. Customize: Change dashboard port 443 → 8443
# ---------------------------------------------------------------------------
echo "🔧 [4/5] Customizing configuration..."

# Modify docker-compose.yml to use port 8443 instead of 443
if [ -f "${WAZUH_DIR}/docker-compose.yml" ]; then
    # Replace "443:5601" with "8443:5601" for dashboard
    sed -i 's/"443:5601"/"8443:5601"/g' "${WAZUH_DIR}/docker-compose.yml" 2>/dev/null || \
    sed -i '' 's/"443:5601"/"8443:5601"/g' "${WAZUH_DIR}/docker-compose.yml" 2>/dev/null || true

    echo "   ✅ Dashboard port changed to 8443"
fi

# Create .env file for Wazuh credentials
cat > "${WAZUH_DIR}/.env" << 'EOF'
# =============================================================================
# Wazuh Docker Environment Variables
# ⚠️  JANGAN commit file ini ke git — sudah ada di .gitignore
# =============================================================================

# Indexer credentials
INDEXER_USERNAME=admin
INDEXER_PASSWORD=SecretPassword

# API credentials (untuk Wazuh Dashboard -> Manager)
API_USERNAME=wazuh-wui
API_PASSWORD=MyS3cr37P450r.*-
EOF

echo "   ✅ Environment file created"

# ---------------------------------------------------------------------------
# 5. Generate certificates
# ---------------------------------------------------------------------------
echo "🔐 [5/5] Generating TLS certificates..."

cd "${WAZUH_DIR}"

if [ -f "generate-indexer-certs.yml" ]; then
    docker compose -f generate-indexer-certs.yml run --rm generator
    echo "   ✅ Certificates generated"
else
    echo "   ⚠️  generate-indexer-certs.yml not found. You may need to generate certs manually."
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
echo ""
echo "=========================================="
echo "✅ Wazuh setup complete!"
echo ""
echo "To start Wazuh:"
echo "  cd wazuh"
echo "  docker compose up -d"
echo ""
echo "To check status:"
echo "  docker compose ps"
echo ""
echo "Dashboard URL : https://localhost:8443"
echo "Username      : admin"
echo "Password      : SecretPassword"
echo ""
echo "⚠️  Wazuh stack butuh ~3-4 GB RAM."
echo "   Tunggu 2-3 menit setelah start untuk inisialisasi."
echo "=========================================="
