# 🛡️ Lab Testing Keamanan — webkominfo

> **⚠️ PERINGATAN PENTING**
>
> Environment ini dirancang **HANYA** untuk lab testing keamanan **LOKAL** terhadap
> aplikasi **milik sendiri** (webkominfo). **DILARANG KERAS** menggunakan setup ini
> untuk menyerang, memindai, atau menguji keamanan sistem milik pihak lain tanpa
> izin tertulis. Semua aktivitas testing harus dilakukan di jaringan lokal yang
> terisolasi.

---

## 📋 Daftar Isi

- [Arsitektur](#arsitektur)
- [Prasyarat](#prasyarat)
- [Cara Menjalankan Environment](#cara-menjalankan-environment)
- [Mengakses Dashboard & Aplikasi](#mengakses-dashboard--aplikasi)
- [Melihat Alert Keamanan](#melihat-alert-keamanan)
- [Custom Detection Rules](#custom-detection-rules)
- [Notifikasi Telegram](#notifikasi-telegram)
- [Backup & Restore Baseline](#backup--restore-baseline)
- [Fail2ban (Opsional)](#fail2ban-opsional)
- [Troubleshooting](#troubleshooting)
- [Struktur Folder](#struktur-folder)

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    JARINGAN LOKAL SAJA                       │
│                                                             │
│  ┌──────────┐     ┌─────────────────────────────────────┐   │
│  │ Browser  │────▶│ Nginx (port 80/443)                 │   │
│  │          │     │  └──▶ Next.js App (internal:3000)    │   │
│  └──────────┘     │       └──▶ PostgreSQL (internal:5432)│   │
│                   │       └──▶ MinIO (internal:9000)     │   │
│                   │                                       │   │
│                   │  Docker Network: webkominfo-net       │   │
│                   └─────────────────────────────────────┘   │
│                              │                               │
│                    Nginx Logs│ (./logs/nginx/)               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Wazuh Agent (Windows Host)                           │   │
│  │  ├─ Log Collection (nginx access/error log)          │   │
│  │  └─ FIM (public/uploads/ & nginx/ folder)            │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Wazuh Stack (Docker — compose terpisah)              │   │
│  │  ├─ Manager  (port 1514, 1515, 55000)                │   │
│  │  ├─ Indexer  (internal:9200)                         │   │
│  │  └─ Dashboard (port 8443)  ──▶  Telegram Bot         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Fail2ban (opsional, Linux only)                      │   │
│  │  └─ Monitor nginx log → iptables block               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Prasyarat

| Komponen | Minimum | Rekomendasi |
|----------|---------|-------------|
| **OS** | Windows 10/11 + WSL2 | Windows 11 + WSL2 |
| **Docker Desktop** | v24.0+ | Latest |
| **RAM** | 8 GB | 16 GB |
| **Disk** | 20 GB free | 50 GB free |
| **Git** | Installed | Latest |

### Konfigurasi Docker Desktop

1. Buka **Docker Desktop → Settings → Resources → Advanced**
2. Set **Memory** ke minimal **6 GB** (sisakan 2 GB untuk Windows)
3. Set **CPUs** ke minimal **4**

### vm.max_map_count (WSL2)

Wazuh Indexer (OpenSearch) memerlukan `vm.max_map_count >= 262144`:

```bash
# Di WSL2 terminal
sudo sysctl -w vm.max_map_count=262144

# Untuk persistence, tambahkan ke /etc/sysctl.conf
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
```

---

## Cara Menjalankan Environment

### Langkah 1: Siapkan Environment Variables

```bash
# Copy template dan isi credential Anda
cp .env.local.example .env.local
# Edit .env.local dengan credential yang sesuai
```

### Langkah 2: Generate SSL Certificate (opsional)

```bash
# Di WSL2 atau Git Bash
bash nginx/ssl/generate-cert.sh
```

### Langkah 3: Jalankan Application Stack

```bash
# Build dan jalankan semua service aplikasi
docker compose up -d --build

# Cek semua service berjalan
docker compose ps

# Test akses via Nginx
curl http://localhost
```

### Langkah 4: Backup Baseline (PENTING — lakukan SEBELUM testing)

```bash
# Backup kondisi awal database + storage
bash scripts/backup-baseline.sh
```

### Langkah 5: Setup Wazuh Manager

```bash
# Setup otomatis: clone repo, generate certs, konfigurasi
bash scripts/setup-wazuh.sh

# Jalankan Wazuh stack
cd wazuh
docker compose up -d

# Tunggu 2-3 menit, lalu cek status
docker compose ps
# Semua container harus "healthy" atau "running"

# Kembali ke root project
cd ..
```

### Langkah 6: Deploy Custom Rules & Integrations

```bash
# Deploy rules dan Telegram integration ke Wazuh Manager
bash scripts/deploy-wazuh-custom.sh
```

### Langkah 7: Install & Konfigurasi Wazuh Agent (Windows)

1. **Download** Wazuh Agent MSI dari: https://packages.wazuh.com/4.x/windows/wazuh-agent-4.12.0-1.msi

2. **Install** via PowerShell (Administrator):
   ```powershell
   msiexec /i wazuh-agent-4.12.0-1.msi /q WAZUH_MANAGER="127.0.0.1" WAZUH_REGISTRATION_SERVER="127.0.0.1"
   ```

3. **Tambahkan konfigurasi** monitoring nginx log & FIM:
   - Buka `C:\Program Files (x86)\ossec-agent\ossec.conf`
   - Tambahkan blok-blok dari `wazuh-custom/agent/ossec-agent-additions.xml`
   - Sesuaikan path dengan lokasi project Anda

4. **Start agent**:
   ```powershell
   Restart-Service WazuhSvc
   ```

5. **Verifikasi** di Wazuh Dashboard → Agents → agent harus status "Active"

---

## Mengakses Dashboard & Aplikasi

| Service | URL | Credential |
|---------|-----|------------|
| **Aplikasi Web** | http://localhost | (sesuai .env.local) |
| **Aplikasi Web (HTTPS)** | https://localhost | (self-signed cert warning) |
| **Wazuh Dashboard** | https://localhost:8443 | admin / SecretPassword |
| **Wazuh API** | https://localhost:55000 | wazuh-wui / MyS3cr37P450r.*- |

> ⚠️ Browser akan menampilkan peringatan "Not Secure" untuk self-signed cert.
> Ini normal untuk testing lokal — klik "Advanced" → "Proceed".

---

## Melihat Alert Keamanan

### Di Wazuh Dashboard

1. Buka https://localhost:8443
2. Login: `admin` / `SecretPassword`
3. Navigasi ke **Threat Intelligence → Threat Hunting**
4. Atau ke **Modules → Security Events**
5. Gunakan filter:
   - `rule.groups: webkominfo` — semua alert custom
   - `rule.groups: sqli` — hanya SQL injection
   - `rule.groups: brute_force` — hanya brute force
   - `rule.level: >= 10` — alert high severity ke atas

### Di Terminal (log langsung)

```bash
# Lihat alert real-time dari Wazuh Manager
docker exec -it single-node-wazuh.manager-1 \
  tail -f /var/ossec/logs/alerts/alerts.json
```

### Test Deteksi (Simulasi Serangan)

```bash
# Test SQL Injection detection
curl "http://localhost/?id=1' UNION SELECT 1,2,3--"
curl "http://localhost/?q=admin' OR '1'='1"

# Test Path Traversal detection
curl "http://localhost/../../etc/passwd"
curl "http://localhost/?file=../../../etc/shadow"

# Test Scanner Tool detection
curl -A "sqlmap/1.5" http://localhost/
curl -A "Nikto/2.1.6" http://localhost/

# Test Brute Force (banyak request gagal)
for i in {1..10}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost/admin; done

# Test Sensitive File Access
curl http://localhost/.env
curl http://localhost/.git/config
```

---

## Custom Detection Rules

File: `wazuh-custom/rules/local_rules.xml`

| Rule ID | Level | Jenis Serangan | Deskripsi |
|---------|-------|-----------------|-----------|
| 100001 | 12 | SQL Injection | Pattern SQLi dasar (UNION SELECT, information_schema, dll) |
| 100002 | 12 | SQL Injection Lanjut | Encoding hex, fungsi SQL mencurigakan |
| 100003 | 12 | Path Traversal | `../`, `/etc/passwd`, encoded variants |
| 100004 | 5 | Auth Failure | Single 401/403 pada endpoint login (base rule) |
| 100005 | 10 | Brute Force | 5+ auth failure dari IP sama dalam 60 detik |
| 100006 | 11 | Scanner Tool | User-Agent dari sqlmap, nikto, nmap, dll |
| 100007 | 10 | Sensitive File | Akses `.env`, `.git`, `wp-admin`, dll |
| 100008 | 11 | XSS | Pattern `<script>`, `javascript:`, `onerror=` |
| 100009 | 10 | Malicious Upload | Upload file `.php`, `.exe`, `.sh`, dll |
| 100010 | 13 | Command Injection | Pattern `|`, `;`, `$(`, `ping`, `whoami` |
| 100011 | 14 | SQLi Masif | 3+ SQLi dari IP sama dalam 2 menit (CRITICAL) |
| 100012 | 12 | Dir Scanning | 20+ request 404 dari IP sama dalam 30 detik |

---

## Notifikasi Telegram

### Setup

1. Buat bot Telegram via [@BotFather](https://t.me/BotFather)
2. Dapatkan **Bot Token** dan **Chat ID**
3. Copy dan edit config:
   ```bash
   cp wazuh-custom/integrations/telegram.conf.example wazuh-custom/integrations/telegram.conf
   # Edit telegram.conf — isi BOT_TOKEN dan CHAT_ID
   ```
4. Deploy ulang:
   ```bash
   bash scripts/deploy-wazuh-custom.sh
   ```

### Format Notifikasi

```
🔴 WAZUH ALERT — HIGH

🔹 Rule ID: 100001
🔹 Level: 12
🔹 Deskripsi: Percobaan SQL Injection terdeteksi pada URL request...
🔹 Source IP: 172.18.0.1
🔹 Agent: DESKTOP-XXXX
🔹 Waktu: 2026-07-20T12:00:00+08:00

Lab Testing Keamanan — webkominfo
```

---

## Backup & Restore Baseline

### Backup (sebelum testing)

```bash
bash scripts/backup-baseline.sh
# Output: ./baseline/20260720_120000/
```

### Restore (setelah testing)

```bash
# Restore dari backup terbaru
bash scripts/restore-baseline.sh

# Atau dari timestamp spesifik
bash scripts/restore-baseline.sh 20260720_120000
```

### Isi Backup

```
baseline/20260720_120000/
├── database.sql        # PostgreSQL dump
├── minio-data/         # File dari MinIO bucket
└── metadata.txt        # Info backup (git hash, timestamp)
```

---

## Fail2ban (Opsional)

> ⚠️ **Catatan**: Fail2ban menggunakan iptables yang **tidak efektif di WSL2**.
> Konfigurasi ini disediakan sebagai referensi untuk deployment di Linux native.

### Install (Linux native saja)

```bash
sudo apt install fail2ban

# Copy konfigurasi
sudo cp fail2ban/jail.local /etc/fail2ban/jail.local
sudo cp fail2ban/filter.d/*.conf /etc/fail2ban/filter.d/

# Restart
sudo systemctl restart fail2ban

# Cek status
sudo fail2ban-client status
sudo fail2ban-client status webkominfo-auth
```

### Jails

| Jail | Target | Ban Time | Max Retry |
|------|--------|----------|-----------|
| webkominfo-auth | Brute force login | 1 jam | 5x |
| webkominfo-scanner | Scanner tools | 24 jam | 1x |
| webkominfo-sqli | SQL injection | 24 jam | 2x |

---

## Troubleshooting

### Container tidak start

```bash
# Cek logs
docker compose logs nginx
docker compose logs web
docker compose logs postgres

# Wazuh stack
cd wazuh && docker compose logs
```

### Nginx error "upstream not found"

Pastikan service `web` sudah running sebelum nginx:
```bash
docker compose up -d postgres minio web
# Tunggu beberapa detik
docker compose up -d nginx
```

### Wazuh Indexer crash (RAM kurang)

```bash
# Stop app stack sementara
docker compose down

# Start Wazuh saja
cd wazuh && docker compose up -d

# Cek status setelah 3 menit
docker compose ps

# Setelah healthy, start app stack kembali
cd .. && docker compose up -d
```

### Wazuh Agent tidak connect

```powershell
# Cek status agent (PowerShell Administrator)
Get-Service WazuhSvc

# Cek log agent
Get-Content "C:\Program Files (x86)\ossec-agent\ossec.log" -Tail 50

# Restart agent
Restart-Service WazuhSvc
```

### Alert tidak muncul di dashboard

1. Cek apakah rules sudah ter-deploy:
   ```bash
   docker exec single-node-wazuh.manager-1 cat /var/ossec/etc/rules/local_rules.xml
   ```
2. Test rules interaktif:
   ```bash
   docker exec -it single-node-wazuh.manager-1 /var/ossec/bin/wazuh-logtest
   # Paste contoh log nginx:
   # 172.18.0.1 - - [20/Jul/2026:12:00:00 +0000] "GET /?id=1' UNION SELECT 1-- HTTP/1.1" 200 1234 "-" "sqlmap/1.5"
   ```
3. Cek apakah agent aktif di Dashboard → Agents

---

## Struktur Folder

```
webkominfo-main/
├── docker-compose.yml         # App stack (nginx + web + postgres + minio)
├── Dockerfile                 # Next.js app image
├── .env.local                 # Credential (gitignored)
├── .env.local.example         # Template credential
├── .gitignore                 # Updated dengan lab entries
│
├── nginx/
│   ├── nginx.conf             # Reverse proxy config
│   └── ssl/
│       ├── generate-cert.sh   # Self-signed cert generator
│       ├── selfsigned.crt     # Generated cert (gitignored)
│       └── selfsigned.key     # Generated key (gitignored)
│
├── logs/
│   └── nginx/
│       ├── access.log         # Nginx access log (gitignored)
│       ├── error.log          # Nginx error log (gitignored)
│       └── .gitkeep           # Keep directory in git
│
├── scripts/
│   ├── backup-baseline.sh     # Backup database + storage
│   ├── restore-baseline.sh    # Restore dari backup
│   ├── setup-wazuh.sh         # Setup Wazuh dari repo resmi
│   └── deploy-wazuh-custom.sh # Deploy rules + integrations
│
├── wazuh/                     # Wazuh Docker (compose terpisah, gitignored)
│   ├── docker-compose.yml     # Wazuh single-node stack
│   ├── generate-indexer-certs.yml
│   └── config/                # Wazuh configurations
│
├── wazuh-custom/              # Custom rules & integrations (tracked by git)
│   ├── rules/
│   │   └── local_rules.xml    # 12 custom detection rules
│   ├── integrations/
│   │   ├── custom-telegram.sh # Telegram notifikasi script
│   │   └── telegram.conf.example
│   └── agent/
│       └── ossec-agent-additions.xml  # Wazuh Agent config additions
│
├── fail2ban/                  # Fail2ban config (opsional, Linux only)
│   ├── jail.local
│   └── filter.d/
│       ├── webkominfo-auth.conf
│       ├── webkominfo-scanner.conf
│       └── webkominfo-sqli.conf
│
├── baseline/                  # Backup data (gitignored)
│   └── <timestamp>/
│
└── src/                       # Next.js source code
    ├── app/
    ├── backend/
    └── frontend/
```

---

## Quick Reference Commands

```bash
# ===== Application Stack =====
docker compose up -d --build    # Start/rebuild semua
docker compose down             # Stop semua
docker compose ps               # Cek status
docker compose logs -f nginx    # Follow nginx logs

# ===== Wazuh Stack =====
cd wazuh
docker compose up -d            # Start Wazuh
docker compose down             # Stop Wazuh
docker compose ps               # Cek status (harus healthy)
cd ..

# ===== Baseline =====
bash scripts/backup-baseline.sh     # Backup
bash scripts/restore-baseline.sh    # Restore terbaru

# ===== Deploy Custom Config =====
bash scripts/deploy-wazuh-custom.sh

# ===== Test Detection =====
curl "http://localhost/?id=1' UNION SELECT 1--"
curl -A "sqlmap" http://localhost/
curl http://localhost/../../etc/passwd
```

---

> **📧 Kontak**: Jika ada pertanyaan tentang setup ini, hubungi administrator project.
>
> **📅 Terakhir diperbarui**: 20 Juli 2026
