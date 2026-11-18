#!/bin/bash
# =============================================================================
# custom-telegram.sh — Wazuh Active Response: Notifikasi Telegram
#
# Script ini mengirim notifikasi ke Telegram bot ketika Wazuh alert
# dengan level >= 10 terjadi.
#
# Cara deploy:
#   1. Copy ke Wazuh Manager container:
#      docker cp custom-telegram.sh <container>:/var/ossec/integrations/custom-telegram.sh
#   2. Set executable:
#      docker exec <container> chmod 755 /var/ossec/integrations/custom-telegram.sh
#   3. Tambahkan di ossec.conf:
#      <integration>
#        <name>custom-telegram</name>
#        <level>10</level>
#        <alert_format>json</alert_format>
#      </integration>
#   4. Set environment variables di container atau .env:
#      TELEGRAM_BOT_TOKEN=your_bot_token_here
#      TELEGRAM_CHAT_ID=your_chat_id_here
#
# ⚠️  JANGAN hardcode token/chat ID di script ini!
# =============================================================================

LOCAL=$(dirname "$0")
ALERT_FILE="$1"
API_KEY="$2"
HOOK_URL="$3"

# Fallback: baca dari file konfigurasi jika env var tidak ada
CONFIG_FILE="/var/ossec/etc/telegram.conf"
if [ -f "${CONFIG_FILE}" ]; then
    source "${CONFIG_FILE}"
fi

BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
CHAT_ID="${TELEGRAM_CHAT_ID:-}"

if [ -z "${BOT_TOKEN}" ] || [ -z "${CHAT_ID}" ]; then
    echo "$(date) custom-telegram.sh: ERROR - TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID tidak diset." \
        >> /var/ossec/logs/integrations.log
    exit 1
fi

# ---------------------------------------------------------------------------
# Parse alert JSON
# ---------------------------------------------------------------------------
ALERT_LEVEL=$(cat "${ALERT_FILE}" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('rule', {}).get('level', 0))
except:
    print(0)
" 2>/dev/null || echo "0")

TITLE=$(cat "${ALERT_FILE}" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    desc = data.get('rule', {}).get('description', 'Unknown')
    print(desc.split('.')[0] if '.' in desc else desc)
except:
    print('Unknown')
" 2>/dev/null || echo "Unknown")

RULE_DESCRIPTION=$(cat "${ALERT_FILE}" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('rule', {}).get('description', 'Unknown'))
except:
    print('Unknown')
" 2>/dev/null || echo "Unknown")

RULE_ID=$(cat "${ALERT_FILE}" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('rule', {}).get('id', '0'))
except:
    print('0')
" 2>/dev/null || echo "0")

SOURCE_IP=$(cat "${ALERT_FILE}" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    src = data.get('data', {}).get('srcip', '')
    if not src:
        src = data.get('agent', {}).get('ip', 'N/A')
    print(src)
except:
    print('N/A')
" 2>/dev/null || echo "N/A")

AGENT_NAME=$(cat "${ALERT_FILE}" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('agent', {}).get('name', 'Unknown'))
except:
    print('Unknown')
" 2>/dev/null || echo "Unknown")

TIMESTAMP=$(cat "${ALERT_FILE}" | python3 -c "
import sys, json
from datetime import datetime, timedelta
try:
    data = json.load(sys.stdin)
    ts = data.get('timestamp', '')
    dt_utc = datetime.strptime(ts[:19], '%Y-%m-%dT%H:%M:%S')
    dt_wita = dt_utc + timedelta(hours=8)
    print(dt_wita.strftime('%Y-%m-%d %H:%M:%S WITA'))
except:
    print('Unknown')
" 2>/dev/null || echo "Unknown")

VHOST=$(cat "${ALERT_FILE}" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('data', {}).get('vhost', 'N/A'))
except:
    print('N/A')
" 2>/dev/null || echo "N/A")

ATTACK_URL=$(cat "${ALERT_FILE}" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('data', {}).get('url', 'N/A'))
except:
    print('N/A')
" 2>/dev/null || echo "N/A")

# ---------------------------------------------------------------------------
# Tentukan emoji severity
# ---------------------------------------------------------------------------
case "${ALERT_LEVEL}" in
    1[0-1]) SEVERITY="Medium-High" ; SEVERITY_UPPER="MEDIUM-HIGH" ;;
    1[2-3]) SEVERITY="High" ; SEVERITY_UPPER="HIGH" ;;
    1[4-5]) SEVERITY="Critical" ; SEVERITY_UPPER="CRITICAL" ;;
    *)      SEVERITY="Info" ; SEVERITY_UPPER="INFO" ;;
esac

# ---------------------------------------------------------------------------
# Kirim notifikasi ke Telegram
# ---------------------------------------------------------------------------
MESSAGE="[WAZUH SECURITY ALERT - ${SEVERITY_UPPER}]

Judul       : ${TITLE}
Level       : ${ALERT_LEVEL} (${SEVERITY})
Rule ID     : ${RULE_ID}
Waktu       : ${TIMESTAMP}
Agent       : ${AGENT_NAME}

Target Domain : ${VHOST}
Sumber IP     : ${SOURCE_IP}
Attack Vector : ${ATTACK_URL}

Deskripsi:
${RULE_DESCRIPTION}

Status      : Lab Testing - Keamanan Internal
Unit        : Webkominfo"

TELEGRAM_URL="https://api.telegram.org/bot${BOT_TOKEN}/sendMessage"

RESPONSE=$(curl -s -X POST "${TELEGRAM_URL}" \
    -d "chat_id=${CHAT_ID}" \
    -d "text=${MESSAGE}" \
    -d "disable_web_page_preview=true" \
    2>/dev/null)

# Log result
if echo "${RESPONSE}" | grep -q '"ok":true'; then
    echo "$(date) custom-telegram.sh: Alert sent successfully (Rule: ${RULE_ID}, Level: ${ALERT_LEVEL})" \
        >> /var/ossec/logs/integrations.log
else
    echo "$(date) custom-telegram.sh: ERROR sending alert - ${RESPONSE}" \
        >> /var/ossec/logs/integrations.log
fi

exit 0
