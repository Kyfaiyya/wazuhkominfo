#!/bin/bash
# =========================================================================
# generate-cert.sh — Generate self-signed SSL certificate untuk Nginx
# 
# Penggunaan: bash nginx/ssl/generate-cert.sh
# Output:     nginx/ssl/selfsigned.crt dan nginx/ssl/selfsigned.key
#
# ⚠️  Self-signed cert hanya untuk testing lokal!
#     Browser akan menampilkan peringatan "Not Secure" — ini normal.
# =========================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔐 Generating self-signed SSL certificate..."
echo "   Output directory: ${SCRIPT_DIR}"

openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout "${SCRIPT_DIR}/selfsigned.key" \
    -out "${SCRIPT_DIR}/selfsigned.crt" \
    -subj "/C=ID/ST=KalTim/L=PPU/O=Webkominfo-Testing/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "✅ Certificate generated successfully!"
echo "   - Certificate: ${SCRIPT_DIR}/selfsigned.crt"
echo "   - Private Key: ${SCRIPT_DIR}/selfsigned.key"
echo ""
echo "⚠️  Certificate ini hanya untuk testing lokal."
echo "   Jangan gunakan di production!"
