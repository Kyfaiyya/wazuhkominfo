#!/bin/bash
# =============================================================================
# deploy-wazuh-custom.sh — Deploy custom rules, integrations, dan config
#                          ke Wazuh Manager container
#
# Penggunaan (dari root project):
#   bash scripts/deploy-wazuh-custom.sh
#
# Script ini meng-copy:
#   1. local_rules.xml → /var/ossec/etc/rules/local_rules.xml
#   2. custom-telegram.sh → /var/ossec/integrations/custom-telegram.sh
#   3. telegram.conf → /var/ossec/etc/telegram.conf (jika ada)
#   4. Restart Wazuh Manager untuk apply perubahan
# =============================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CUSTOM_DIR="${PROJECT_ROOT}/wazuh-custom"
MANAGER_CONTAINER="wazuh-wazuh.manager-1"
if ! docker ps --format '{{.Names}}' | grep -q "^${MANAGER_CONTAINER}$"; then
    MANAGER_CONTAINER="single-node-wazuh.manager-1"
fi

echo "=========================================="
echo "🚀 Deploy Wazuh Custom Config"
echo "=========================================="

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "${MANAGER_CONTAINER}"; then
    echo "❌ Wazuh Manager container '${MANAGER_CONTAINER}' tidak berjalan."
    echo ""
    echo "   Coba salah satu nama container ini:"
    docker ps --format '{{.Names}}' | grep -i wazuh || echo "   (tidak ada container wazuh)"
    echo ""
    echo "   Atau edit variable MANAGER_CONTAINER di script ini."
    exit 1
fi

# 1. Deploy custom rules
echo "📦 [1/5] Deploying local_rules.xml..."
if [ -f "${CUSTOM_DIR}/rules/local_rules.xml" ]; then
    docker cp "${CUSTOM_DIR}/rules/local_rules.xml" \
        "${MANAGER_CONTAINER}:/var/ossec/etc/rules/local_rules.xml"
    echo "   ✅ local_rules.xml deployed"
else
    echo "   ⚠️  local_rules.xml not found, skipping"
fi

# 2. Deploy custom decoders
echo "📦 [2/6] Deploying custom decoders..."
if [ -f "${CUSTOM_DIR}/decoders/local_decoder.xml" ]; then
    docker cp "${CUSTOM_DIR}/decoders/local_decoder.xml" \
        "${MANAGER_CONTAINER}:/var/ossec/etc/decoders/local_decoder.xml"
    echo "   ✅ local_decoder.xml deployed"
fi
if [ -f "${CUSTOM_DIR}/decoders/0375-web-accesslog_decoders.xml" ]; then
    docker cp "${CUSTOM_DIR}/decoders/0375-web-accesslog_decoders.xml" \
        "${MANAGER_CONTAINER}:/var/ossec/ruleset/decoders/0375-web-accesslog_decoders.xml"
    echo "   ✅ 0375-web-accesslog_decoders.xml deployed"
fi

# 3. Deploy manager configuration
echo "📦 [3/6] Deploying ossec.conf (wazuh_manager.conf)..."
if [ -f "${PROJECT_ROOT}/wazuh/config/wazuh_cluster/wazuh_manager.conf" ]; then
    docker cp "${PROJECT_ROOT}/wazuh/config/wazuh_cluster/wazuh_manager.conf" \
        "${MANAGER_CONTAINER}:/var/ossec/etc/ossec.conf"
    echo "   ✅ ossec.conf deployed"
else
    echo "   ⚠️  wazuh_manager.conf not found, skipping"
fi

# 4. Deploy Telegram integration
echo "📦 [4/6] Deploying custom-telegram.sh..."
if [ -f "${CUSTOM_DIR}/integrations/custom-telegram.sh" ]; then
    docker cp "${CUSTOM_DIR}/integrations/custom-telegram.sh" \
        "${MANAGER_CONTAINER}:/var/ossec/integrations/custom-telegram.sh"
    docker exec "${MANAGER_CONTAINER}" \
        chmod 755 /var/ossec/integrations/custom-telegram.sh
    echo "   ✅ custom-telegram.sh deployed"
else
    echo "   ⚠️  custom-telegram.sh not found, skipping"
fi

# 5. Deploy Telegram config (if exists)
echo "📦 [5/6] Deploying telegram.conf..."
if [ -f "${CUSTOM_DIR}/integrations/telegram.conf" ]; then
    docker cp "${CUSTOM_DIR}/integrations/telegram.conf" \
        "${MANAGER_CONTAINER}:/var/ossec/etc/telegram.conf"
    echo "   ✅ telegram.conf deployed"
else
    echo "   ⚠️  telegram.conf not found (copy telegram.conf.example dan isi credential Anda)"
fi

# 6. Restart Wazuh Manager
echo "🔄 [6/6] Restarting Wazuh Manager..."
docker exec "${MANAGER_CONTAINER}" /var/ossec/bin/wazuh-control restart
echo "   ✅ Wazuh Manager restarted"

echo ""
echo "=========================================="
echo "✅ Deploy selesai!"
echo ""
echo "Verifikasi rules ter-load:"
echo "  docker exec ${MANAGER_CONTAINER} /var/ossec/bin/wazuh-logtest"
echo ""
echo "Cek log integration:"
echo "  docker exec ${MANAGER_CONTAINER} tail -f /var/ossec/logs/integrations.log"
echo "=========================================="
